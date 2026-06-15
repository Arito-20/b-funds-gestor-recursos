import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from '../../domain/entities/resource.entity';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { Initiative } from '../../domain/entities/initiative.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, PurchaseOrder, Initiative])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}