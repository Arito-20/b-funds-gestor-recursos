import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Initiative } from '../../domain/entities/initiative.entity';

@Injectable()
export class InitiativesService {
  constructor(
    @InjectRepository(Initiative)
    private readonly initiativeRepository: Repository<Initiative>,
  ) {}

  findAll(): Promise<Initiative[]> {
    return this.initiativeRepository.find({ order: { name: 'ASC' } });
  }
}
