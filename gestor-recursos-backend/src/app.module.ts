import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Manager } from './domain/entities/manager.entity';
import { User } from './domain/entities/user.entity';
import { Provider } from './domain/entities/provider.entity';
import { Initiative } from './domain/entities/initiative.entity';
import { Resource } from './domain/entities/resource.entity';
import { PurchaseOrder } from './domain/entities/purchase-order.entity';
import { ExchangeRate } from './domain/entities/exchange-rate.entity';
import { AlertNotification } from './domain/entities/alert-notification.entity';
import { ResourcesModule } from './modules/resources/resources.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ManagersModule } from './modules/managers/managers.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { InitiativesModule } from './modules/initiatives/initiatives.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: process.env.DATABASE_LOCATION || 'database.sqlite',
      autoSave: true,
      entities: [
        Manager, User, Provider, Initiative,
        Resource, PurchaseOrder, ExchangeRate, AlertNotification,
      ],
      synchronize: true,
      logging: false,
    }),
    ResourcesModule,
    PurchaseOrdersModule,
    DashboardModule,
    ManagersModule,
    ProvidersModule,
    InitiativesModule,
    ExchangeRatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 