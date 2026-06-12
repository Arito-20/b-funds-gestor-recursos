import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TestEmailDto } from './dto/test-email.dto';

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

  @Post('test-email')
  testEmail(@CurrentUser() user: any, @Body() body: TestEmailDto) {
    return this.alertsService.sendTestEmail(user.email, body?.to);
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
