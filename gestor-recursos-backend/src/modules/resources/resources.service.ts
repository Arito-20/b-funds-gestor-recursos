import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../../domain/entities/resource.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceCalculationsService } from '../../domain/services/resource-calculations.service';
import { ResourceStatus } from '../../domain/enums';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  async create(dto: CreateResourceDto): Promise<Resource> {
    const monthlyCostUsd = ResourceCalculationsService.calculateMonthlyCostUsd(
      dto.monthlyCostOriginal,
      dto.exchangeRateToUsd,
    );
    const durationMonths = ResourceCalculationsService.calculateDurationMonths(
      dto.startDate,
      dto.endDate,
    );
    const totalCostUsd = ResourceCalculationsService.calculateTotalCostUsd(
      monthlyCostUsd,
      durationMonths,
    );

    const resource = this.resourceRepository.create({
      ...dto,
      monthlyCostUsd,
      durationMonths,
      totalCostUsd,
      status: ResourceStatus.ACTIVE,
    });

    return this.resourceRepository.save(resource);
  }

  async findAll(managerId?: number, role?: string): Promise<any[]> {
    const query = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.provider', 'provider')
      .leftJoinAndSelect('resource.manager', 'manager')
      .leftJoinAndSelect('resource.mainInitiative', 'initiative')
      .where('resource.status != :cancelled', { cancelled: ResourceStatus.CANCELLED });

    if (role === 'MANAGER' && managerId) {
      query.andWhere('resource.managerId = :managerId', { managerId });
    }

    const resources = await query.getMany();

    return resources.map((r) => ({
      ...r,
      expirationStatus: ResourceCalculationsService.getExpirationStatus(r.endDate),
      daysRemaining: ResourceCalculationsService.getDaysRemaining(r.endDate),
    }));
  }

  async findOne(id: number, managerId?: number, role?: string): Promise<any> {
    const query = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.provider', 'provider')
      .leftJoinAndSelect('resource.manager', 'manager')
      .leftJoinAndSelect('resource.mainInitiative', 'initiative')
      .where('resource.id = :id', { id });

    if (role === 'MANAGER' && managerId) {
      query.andWhere('resource.managerId = :managerId', { managerId });
    }

    const resource = await query.getOne();
    if (!resource) throw new NotFoundException(`Recurso ${id} no encontrado`);

    return {
      ...resource,
      expirationStatus: ResourceCalculationsService.getExpirationStatus(resource.endDate),
      daysRemaining: ResourceCalculationsService.getDaysRemaining(resource.endDate),
    };
  }

  async update(id: number, dto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) throw new NotFoundException(`Recurso ${id} no encontrado`);

    const updated = { ...resource, ...dto };

    if (dto.monthlyCostOriginal || dto.exchangeRateToUsd) {
      updated.monthlyCostUsd = ResourceCalculationsService.calculateMonthlyCostUsd(
        updated.monthlyCostOriginal,
        updated.exchangeRateToUsd,
      );
    }
    if (dto.startDate || dto.endDate) {
      updated.durationMonths = ResourceCalculationsService.calculateDurationMonths(
        updated.startDate,
        updated.endDate,
      );
    }
    updated.totalCostUsd = ResourceCalculationsService.calculateTotalCostUsd(
      updated.monthlyCostUsd,
      updated.durationMonths,
    );

    return this.resourceRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) throw new NotFoundException(`Recurso ${id} no encontrado`);
    resource.status = ResourceStatus.CANCELLED;
    await this.resourceRepository.save(resource);
  }
}