import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../../domain/entities/resource.entity';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { Initiative } from '../../domain/entities/initiative.entity';
import { ResourceCalculationsService } from '../../domain/services/resource-calculations.service';
import { ResourceStatus, PurchaseOrderStatus, ExpirationStatus } from '../../domain/enums';

const EXPIRATION_PRIORITY: Record<string, number> = {
  [ExpirationStatus.EXPIRED]: 0,
  [ExpirationStatus.RED]: 1,
  [ExpirationStatus.AMBER]: 2,
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Initiative)
    private readonly initiativeRepository: Repository<Initiative>,
  ) {}

  async getSummary(managerId?: number, role?: string) {
    const resourceQuery = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.manager', 'manager')
      .leftJoinAndSelect('resource.mainInitiative', 'initiative')
      .leftJoinAndSelect('resource.provider', 'provider')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE });

    if (role === 'MANAGER' && managerId) {
      resourceQuery.andWhere('resource.managerId = :managerId', { managerId });
    }

    const resources = await resourceQuery.getMany();
    const allInitiatives = await this.initiativeRepository.find();

    const withStatus = resources.map((r) => ({
      ...r,
      expirationStatus: ResourceCalculationsService.getExpirationStatus(r.endDate),
      daysRemaining: ResourceCalculationsService.getDaysRemaining(r.endDate),
    }));

    const amber = withStatus.filter(r => r.expirationStatus === ExpirationStatus.AMBER);
    const red = withStatus.filter(r => r.expirationStatus === ExpirationStatus.RED);
    const expired = withStatus.filter(r => r.expirationStatus === ExpirationStatus.EXPIRED);

    const monthlyCostUsd = resources.reduce(
      (sum, r) => sum + Number(r.monthlyCostUsd), 0,
    );
    const totalCommittedUsd = resources.reduce(
      (sum, r) => sum + Number(r.totalCostUsd), 0,
    );

    const initiativeIds = new Set(resources.map(r => r.mainInitiativeId));
    const visibleBudgetUsd = role === 'MANAGER'
      ? allInitiatives
          .filter(i => initiativeIds.has(i.id))
          .reduce((sum, i) => sum + Number(i.budgetUsd), 0)
      : allInitiatives.reduce((sum, i) => sum + Number(i.budgetUsd), 0);
    const availableBudgetUsd = Math.max(visibleBudgetUsd - totalCommittedUsd, 0);

    const currentPeriod = this.getCurrentPeriodMonth();

    const pendingPOs = await this.countPendingPOs(managerId, role);
    const pendingPOsThisMonth = await this.countPendingPOs(managerId, role, currentPeriod);

    const budgetById = new Map(allInitiatives.map(i => [i.id, Number(i.budgetUsd)]));
    const costByInitiative = this.groupBy(resources, 'mainInitiativeId').map(
      ({ key, items }) => {
        const initiativeId = Number(key);
        const budgetUsd = budgetById.get(initiativeId) ?? 0;
        const committed = Math.round(
          items.reduce((sum, r) => sum + Number(r.totalCostUsd), 0) * 100,
        ) / 100;
        const availableUsd = Math.max(budgetUsd - committed, 0);
        const usagePercentage = budgetUsd > 0
          ? Math.round((committed / budgetUsd) * 1000) / 10
          : 0;

        return {
          initiativeId,
          initiativeName: items[0]?.mainInitiative?.name ?? 'Sin iniciativa',
          totalCostUsd: committed,
          resourceCount: items.length,
          budgetUsd,
          availableUsd,
          usagePercentage,
        };
      },
    );

    const resourcesByCountry = this.groupBy(resources, 'country').map(
      ({ key, items }) => ({
        country: key,
        resourceCount: items.length,
        monthlyCostUsd: Math.round(
          items.reduce((sum, r) => sum + Number(r.monthlyCostUsd), 0) * 100,
        ) / 100,
      }),
    );

    const expiringSoon = withStatus
      .filter(r => r.expirationStatus !== ExpirationStatus.GREEN)
      .sort((a, b) => {
        const priorityA = EXPIRATION_PRIORITY[a.expirationStatus] ?? 99;
        const priorityB = EXPIRATION_PRIORITY[b.expirationStatus] ?? 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.daysRemaining - b.daysRemaining;
      })
      .map(r => ({
        id: r.id,
        consultantName: r.consultantName,
        profile: r.profile,
        endDate: r.endDate,
        daysRemaining: r.daysRemaining,
        expirationStatus: r.expirationStatus,
        managerName: r.manager?.name ?? '—',
        monthlyCostUsd: Number(r.monthlyCostUsd),
      }));

    return {
      totalResources: resources.length,
      activeResources: resources.length,
      expiringAmber: amber.length,
      expiringRed: red.length,
      expired: expired.length,
      monthlyCostUsd: Math.round(monthlyCostUsd * 100) / 100,
      totalCommittedUsd: Math.round(totalCommittedUsd * 100) / 100,
      visibleBudgetUsd: Math.round(visibleBudgetUsd * 100) / 100,
      availableBudgetUsd: Math.round(availableBudgetUsd * 100) / 100,
      pendingPurchaseOrders: pendingPOs,
      pendingPurchaseOrdersThisMonth: pendingPOsThisMonth,
      expiringSoon,
      costByInitiative,
      resourcesByCountry,
    };
  }

  private async countPendingPOs(
    managerId?: number,
    role?: string,
    periodMonth?: string,
  ): Promise<number> {
    const poQuery = this.poRepository
      .createQueryBuilder('po')
      .leftJoin('po.resource', 'resource')
      .where('po.status = :status', { status: PurchaseOrderStatus.PENDING });

    if (role === 'MANAGER' && managerId) {
      poQuery.andWhere('resource.managerId = :managerId', { managerId });
    }

    if (periodMonth) {
      poQuery.andWhere('po.periodMonth = :periodMonth', { periodMonth });
    }

    return poQuery.getCount();
  }

  private getCurrentPeriodMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private groupBy<T>(array: T[], key: keyof T) {
    const map = new Map<unknown, T[]>();
    for (const item of array) {
      const k = item[key];
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    return Array.from(map.entries()).map(([k, items]) => ({ key: k, items }));
  }
}
