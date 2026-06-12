import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { Resource } from '../../domain/entities/resource.entity';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderGenerationService } from '../../domain/services/purchase-order-generation.service';
import { PurchaseOrderStatus } from '../../domain/enums';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  private withResourceRelations(
    query: SelectQueryBuilder<PurchaseOrder>,
  ): SelectQueryBuilder<PurchaseOrder> {
    return query
      .leftJoinAndSelect('po.resource', 'resource')
      .leftJoinAndSelect('po.provider', 'provider')
      .leftJoinAndSelect('resource.provider', 'resourceProvider')
      .leftJoinAndSelect('resource.manager', 'manager')
      .leftJoinAndSelect('resource.mainInitiative', 'initiative');
  }

  async generateForResource(resourceId: number): Promise<PurchaseOrder[]> {
    const resource = await this.resourceRepository.findOne({ where: { id: resourceId } });
    if (!resource) throw new NotFoundException(`Recurso ${resourceId} no encontrado`);

    // Eliminar OCs pendientes previas antes de regenerar
    await this.poRepository.delete({ resourceId, status: PurchaseOrderStatus.PENDING });

    const orders = PurchaseOrderGenerationService.generateMonthlyOrders(resource);
    const created = this.poRepository.create(orders as PurchaseOrder[]);
    return this.poRepository.save(created);
  }

  async findByResource(resourceId: number): Promise<PurchaseOrder[]> {
    return this.withResourceRelations(
      this.poRepository.createQueryBuilder('po'),
    )
      .where('po.resourceId = :resourceId', { resourceId })
      .orderBy('po.periodMonth', 'ASC')
      .getMany();
  }

  async findAll(managerId?: number, role?: string): Promise<PurchaseOrder[]> {
    const query = this.withResourceRelations(
      this.poRepository.createQueryBuilder('po'),
    ).orderBy('po.periodMonth', 'ASC');

    if (role === 'MANAGER' && managerId) {
      query.andWhere('resource.managerId = :managerId', { managerId });
    }

    return query.getMany();
  }

  async findPending(managerId?: number, role?: string): Promise<PurchaseOrder[]> {
    const query = this.withResourceRelations(
      this.poRepository.createQueryBuilder('po'),
    )
      .where('po.status = :status', { status: PurchaseOrderStatus.PENDING })
      .orderBy('po.periodMonth', 'ASC');

    if (role === 'MANAGER' && managerId) {
      query.andWhere('resource.managerId = :managerId', { managerId });
    }

    return query.getMany();
  }

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.poRepository.findOne({ where: { id } });
    if (!po) throw new NotFoundException(`OC ${id} no encontrada`);
    Object.assign(po, dto);
    return this.poRepository.save(po);
  }
}