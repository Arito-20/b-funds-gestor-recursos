import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AlertNotification } from '../../domain/entities/alert-notification.entity';
import { Resource } from '../../domain/entities/resource.entity';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { Manager } from '../../domain/entities/manager.entity';
import { ResourceCalculationsService } from '../../domain/services/resource-calculations.service';
import {
  AlertType,
  AlertStatus,
  ResourceStatus,
  PurchaseOrderStatus,
} from '../../domain/enums';

interface MockedEmail {
  managerName: string;
  managerEmail: string;
  subject: string;
  message: string;
}

export interface RunValidationResult {
  processedResources: number;
  processedPurchaseOrders: number;
  createdAlerts: number;
  skippedDuplicates: number;
  alertsByType: {
    EXPIRATION_AMBER: number;
    EXPIRATION_RED: number;
    EXPIRED: number;
    PO_PENDING: number;
  };
  mockedEmails: MockedEmail[];
}

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertNotification)
    private readonly alertRepository: Repository<AlertNotification>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
  ) {}

  async runValidation(managerId?: number, role?: string): Promise<RunValidationResult> {
    const result: RunValidationResult = {
      processedResources: 0,
      processedPurchaseOrders: 0,
      createdAlerts: 0,
      skippedDuplicates: 0,
      alertsByType: {
        EXPIRATION_AMBER: 0,
        EXPIRATION_RED: 0,
        EXPIRED: 0,
        PO_PENDING: 0,
      },
      mockedEmails: [],
    };

    const resources = await this.getVisibleResources(managerId, role);
    result.processedResources = resources.length;

    for (const resource of resources) {
      const daysRemaining = ResourceCalculationsService.getDaysRemaining(resource.endDate);
      const alertType = this.getResourceAlertType(daysRemaining);
      if (!alertType) continue;

      const created = await this.createAlertIfNotDuplicate({
        alertType,
        resourceId: resource.id,
        purchaseOrderId: null,
        managerId: resource.managerId,
        daysRemaining,
        message: this.buildResourceMessage(resource, alertType, daysRemaining),
        manager: resource.manager,
        result,
      });

      if (created) {
        result.mockedEmails.push(this.buildMockedEmail(
          resource.manager,
          this.buildResourceSubject(resource, alertType),
          this.buildResourceMessage(resource, alertType, daysRemaining),
        ));
      }
    }

    const purchaseOrders = await this.getVisiblePendingPurchaseOrders(managerId, role);
    result.processedPurchaseOrders = purchaseOrders.length;

    for (const po of purchaseOrders) {
      const created = await this.createAlertIfNotDuplicate({
        alertType: AlertType.PO_PENDING,
        resourceId: po.resourceId,
        purchaseOrderId: po.id,
        managerId: po.resource.managerId,
        daysRemaining: null,
        message: this.buildPoMessage(po),
        manager: po.resource.manager,
        result,
      });

      if (created) {
        result.mockedEmails.push(this.buildMockedEmail(
          po.resource.manager,
          this.buildPoSubject(po),
          this.buildPoMessage(po),
        ));
      }
    }

    return result;
  }

  async findAll(managerId?: number, role?: string): Promise<AlertNotification[]> {
    const query = this.withRelations(
      this.alertRepository.createQueryBuilder('alert'),
    ).orderBy('alert.sentAt', 'DESC');

    this.applyManagerScope(query, managerId, role);

    return query.getMany();
  }

  async getSummary(managerId?: number, role?: string) {
    const query = this.alertRepository.createQueryBuilder('alert');

    if (role === 'MANAGER' && managerId) {
      query.andWhere('alert.managerId = :managerId', { managerId });
    }

    const alerts = await query.getMany();

    return {
      total: alerts.length,
      expirationAmber: alerts.filter((a) => a.alertType === AlertType.EXPIRATION_AMBER).length,
      expirationRed: alerts.filter((a) => a.alertType === AlertType.EXPIRATION_RED).length,
      expired: alerts.filter((a) => a.alertType === AlertType.EXPIRED).length,
      poPending: alerts.filter((a) => a.alertType === AlertType.PO_PENDING).length,
      mocked: alerts.filter((a) => a.status === AlertStatus.MOCKED).length,
      failed: alerts.filter((a) => a.status === AlertStatus.FAILED).length,
    };
  }

  private withRelations(
    query: SelectQueryBuilder<AlertNotification>,
  ): SelectQueryBuilder<AlertNotification> {
    return query
      .leftJoinAndSelect('alert.resource', 'resource')
      .leftJoinAndSelect('resource.manager', 'resourceManager')
      .leftJoinAndSelect('resource.provider', 'provider')
      .leftJoinAndSelect('resource.mainInitiative', 'initiative')
      .leftJoinAndSelect('alert.purchaseOrder', 'purchaseOrder')
      .leftJoinAndSelect('alert.manager', 'manager');
  }

  private applyManagerScope(
    query: SelectQueryBuilder<AlertNotification>,
    managerId?: number,
    role?: string,
  ): void {
    if (role === 'MANAGER' && managerId) {
      query.andWhere('alert.managerId = :managerId', { managerId });
    }
  }

  private async getVisibleResources(managerId?: number, role?: string): Promise<Resource[]> {
    const query = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.manager', 'manager')
      .leftJoinAndSelect('resource.provider', 'provider')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE });

    if (role === 'MANAGER' && managerId) {
      query.andWhere('resource.managerId = :managerId', { managerId });
    }

    return query.getMany();
  }

  private async getVisiblePendingPurchaseOrders(
    managerId?: number,
    role?: string,
  ): Promise<PurchaseOrder[]> {
    const currentMonth = this.getCurrentPeriodMonth();

    const query = this.poRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.resource', 'resource')
      .leftJoinAndSelect('resource.manager', 'manager')
      .leftJoinAndSelect('resource.provider', 'provider')
      .where('po.status = :status', { status: PurchaseOrderStatus.PENDING })
      .andWhere('po.periodMonth <= :currentMonth', { currentMonth });

    if (role === 'MANAGER' && managerId) {
      query.andWhere('resource.managerId = :managerId', { managerId });
    }

    return query.getMany();
  }

  private getResourceAlertType(daysRemaining: number): AlertType | null {
    if (daysRemaining > 30) return null;
    if (daysRemaining < 0) return AlertType.EXPIRED;
    if (daysRemaining < 15) return AlertType.EXPIRATION_RED;
    return AlertType.EXPIRATION_AMBER;
  }

  private async createAlertIfNotDuplicate(params: {
    alertType: AlertType;
    resourceId: number | null;
    purchaseOrderId: number | null;
    managerId: number;
    daysRemaining: number | null;
    message: string;
    manager?: Manager;
    result: RunValidationResult;
  }): Promise<boolean> {
    const isDuplicate = await this.existsDuplicateToday({
      alertType: params.alertType,
      resourceId: params.resourceId,
      purchaseOrderId: params.purchaseOrderId,
      managerId: params.managerId,
    });

    if (isDuplicate) {
      params.result.skippedDuplicates += 1;
      return false;
    }

    if (!params.manager) {
      params.manager = await this.managerRepository.findOne({
        where: { id: params.managerId },
      }) ?? undefined;
    }

    const alert = new AlertNotification();
    alert.alertType = params.alertType;
    alert.resourceId = params.resourceId;
    alert.purchaseOrderId = params.purchaseOrderId;
    alert.managerId = params.managerId;
    alert.daysRemaining = params.daysRemaining;
    alert.status = AlertStatus.MOCKED;
    alert.message = params.message;

    await this.alertRepository.save(alert);

    params.result.createdAlerts += 1;
    params.result.alertsByType[params.alertType] += 1;

    return true;
  }

  private async existsDuplicateToday(params: {
    alertType: AlertType;
    resourceId: number | null;
    purchaseOrderId: number | null;
    managerId: number;
  }): Promise<boolean> {
    const { start, end } = this.getTodayRange();

    const query = this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.alertType = :alertType', { alertType: params.alertType })
      .andWhere('alert.managerId = :managerId', { managerId: params.managerId })
      .andWhere('alert.sentAt >= :start', { start })
      .andWhere('alert.sentAt < :end', { end });

    if (params.resourceId != null) {
      query.andWhere('alert.resourceId = :resourceId', { resourceId: params.resourceId });
    } else {
      query.andWhere('alert.resourceId IS NULL');
    }

    if (params.purchaseOrderId != null) {
      query.andWhere('alert.purchaseOrderId = :purchaseOrderId', {
        purchaseOrderId: params.purchaseOrderId,
      });
    } else {
      query.andWhere('alert.purchaseOrderId IS NULL');
    }

    return (await query.getCount()) > 0;
  }

  private getTodayRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { start, end };
  }

  private getCurrentPeriodMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private buildResourceSubject(resource: Resource, alertType: AlertType): string {
    const labels: Record<AlertType, string> = {
      [AlertType.EXPIRATION_AMBER]: 'Alerta ámbar de vencimiento',
      [AlertType.EXPIRATION_RED]: 'Alerta roja de vencimiento',
      [AlertType.EXPIRED]: 'Recurso vencido',
      [AlertType.PO_PENDING]: 'OC pendiente',
    };
    return `${labels[alertType]} - ${resource.consultantName}`;
  }

  private buildResourceMessage(
    resource: Resource,
    alertType: AlertType,
    daysRemaining: number,
  ): string {
    const managerEmail = resource.manager?.email ?? 'manager@belcorp.com';
    const endDate = resource.endDate;

    if (alertType === AlertType.EXPIRED) {
      return `[MOCK] Se enviaría correo a ${managerEmail}: el recurso "${resource.consultantName}" (${resource.profile}) venció hace ${Math.abs(daysRemaining)} día(s). Fecha fin: ${endDate}.`;
    }

    return `[MOCK] Se enviaría correo a ${managerEmail}: el recurso "${resource.consultantName}" (${resource.profile}) vence en ${daysRemaining} día(s). Fecha fin: ${endDate}.`;
  }

  private buildPoSubject(po: PurchaseOrder): string {
    return `OC pendiente - ${po.periodMonth} - ${po.resource.consultantName}`;
  }

  private buildPoMessage(po: PurchaseOrder): string {
    const managerEmail = po.resource.manager?.email ?? 'manager@belcorp.com';
    return `[MOCK] Se enviaría correo a ${managerEmail}: OC pendiente del periodo ${po.periodMonth} para el recurso "${po.resource.consultantName}" (${po.resource.profile}). Monto: ${po.amountUsd} USD.`;
  }

  private buildMockedEmail(
    manager: Manager | undefined,
    subject: string,
    message: string,
  ): MockedEmail {
    return {
      managerName: manager?.name ?? 'Manager',
      managerEmail: manager?.email ?? 'manager@belcorp.com',
      subject,
      message,
    };
  }
}
