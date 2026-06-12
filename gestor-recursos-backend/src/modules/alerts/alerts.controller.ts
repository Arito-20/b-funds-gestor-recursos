import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alerts')
@ApiSecurity('demo-auth')
@UseGuards(MockAuthGuard)
@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('run-validation')
  runValidation(@CurrentUser() user: any) {
    return this.alertsService.runValidation(user.managerId, user.role);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.alertsService.getSummary(user.managerId, user.role);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.alertsService.findAll(user.managerId, user.role);
  }
}
