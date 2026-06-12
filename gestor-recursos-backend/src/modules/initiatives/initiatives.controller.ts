import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { InitiativesService } from './initiatives.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';

@ApiTags('Initiatives')
@ApiSecurity('demo-auth')
@UseGuards(MockAuthGuard)
@Controller('api/initiatives')
export class InitiativesController {
  constructor(private readonly initiativesService: InitiativesService) {}

  @Get()
  findAll() {
    return this.initiativesService.findAll();
  }
}
