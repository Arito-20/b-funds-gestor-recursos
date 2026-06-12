import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn,
  } from 'typeorm';
  import { AlertType, AlertStatus } from '../enums';
  import { Resource } from './resource.entity';
  import { Manager } from './manager.entity';
  
  @Entity('alert_notifications')
  export class AlertNotification {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: true })
    resourceId: number;
  
    @ManyToOne(() => Resource, { nullable: true })
    @JoinColumn({ name: 'resourceId' })
    resource: Resource;
  
    @Column({ nullable: true })
    purchaseOrderId: number;
  
    @Column()
    managerId: number;
  
    @ManyToOne(() => Manager)
    @JoinColumn({ name: 'managerId' })
    manager: Manager;
  
    @Column({ type: 'simple-enum', enum: AlertType })
    alertType: AlertType;
  
    @Column({ nullable: true })
    daysRemaining: number;
  
    @Column({ type: 'simple-enum', enum: AlertStatus, default: AlertStatus.MOCKED })
    status: AlertStatus;
  
    @Column({ type: 'text', nullable: true })
    message: string;
  
    @CreateDateColumn()
    sentAt: Date;
  }