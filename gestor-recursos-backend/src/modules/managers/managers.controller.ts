import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';

@ApiTags('Managers')
@ApiSecurity('demo-auth')
@UseGuards(MockAuthGuard)
@Controller('api/managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get()
  findAll() {
    return this.managersService.findAll();
  }
}
