import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';

@ApiTags('Exchange Rates')
@ApiSecurity('demo-auth')
@UseGuards(MockAuthGuard)
@Controller('api/exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  findAll() {
    return this.exchangeRatesService.findAll();
  }
}
