import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';

@ApiTags('Providers')
@ApiSecurity('demo-auth')
@UseGuards(MockAuthGuard)
@Controller('api/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll() {
    return this.providersService.findAll();
  }
}
