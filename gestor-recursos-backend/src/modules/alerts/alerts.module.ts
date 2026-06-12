import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertNotification } from '../../domain/entities/alert-notification.entity';
import { Resource } from '../../domain/entities/resource.entity';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { Manager } from '../../domain/entities/manager.entity';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlertNotification,
      Resource,
      PurchaseOrder,
      Manager,
    ]),
  ],
  controllers: [AlertsController],
  providers: [AlertsService, EmailService],
})
export class AlertsModule {}
