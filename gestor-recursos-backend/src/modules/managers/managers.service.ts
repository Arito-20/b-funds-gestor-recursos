import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager } from '../../domain/entities/manager.entity';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
  ) {}

  findAll(): Promise<Manager[]> {
    return this.managerRepository.find({ order: { name: 'ASC' } });
  }
}
