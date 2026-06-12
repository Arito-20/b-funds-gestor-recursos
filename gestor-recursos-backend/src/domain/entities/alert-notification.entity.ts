import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn,
  } from 'typeorm';
  import { AlertType, AlertStatus } from '../enums';
  import { Resource } from './resource.entity';
  import { Manager } from './manager.entity';
  import { PurchaseOrder } from './purchase-order.entity';
  
  @Entity('alert_notifications')
  export class AlertNotification {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'integer', nullable: true })
    resourceId: number | null;
  
    @ManyToOne(() => Resource, { nullable: true })
    @JoinColumn({ name: 'resourceId' })
    resource: Resource;
  
    @Column({ type: 'integer', nullable: true })
    purchaseOrderId: number | null;

    @ManyToOne(() => PurchaseOrder, { nullable: true })
    @JoinColumn({ name: 'purchaseOrderId' })
    purchaseOrder: PurchaseOrder;
  
    @Column()
    managerId: number;
  
    @ManyToOne(() => Manager)
    @JoinColumn({ name: 'managerId' })
    manager: Manager;
  
    @Column({ type: 'simple-enum', enum: AlertType })
    alertType: AlertType;
  
    @Column({ type: 'integer', nullable: true })
    daysRemaining: number | null;
  
    @Column({ type: 'simple-enum', enum: AlertStatus, default: AlertStatus.MOCKED })
    status: AlertStatus;
  
    @Column({ type: 'text', nullable: true })
    message: string;
  
    @CreateDateColumn()
    sentAt: Date;
  }