import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  findAll(): Promise<ExchangeRate[]> {
    return this.exchangeRateRepository.find({ order: { currency: 'ASC' } });
  }
}
