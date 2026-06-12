import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn,
  } from 'typeorm';
  import { PurchaseOrderStatus } from '../enums';
  import { Resource } from './resource.entity';
  import { Provider } from './provider.entity';
  
  @Entity('purchase_orders')
  export class PurchaseOrder {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    resourceId: number;
  
    @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'resourceId' })
    resource: Resource;
  
    @Column()
    periodMonth: string;
  
    @Column({ nullable: true })
    poNumber: string;
  
    @Column({ type: 'simple-enum', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.PENDING })
    status: PurchaseOrderStatus;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amountOriginal: number;
  
    @Column()
    currency: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 4 })
    exchangeRateToUsd: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amountUsd: number;
  
    @Column({ nullable: true })
    providerId: number;
  
    @ManyToOne(() => Provider, { nullable: true })
    @JoinColumn({ name: 'providerId' })
    provider: Provider;
  
    @Column({ type: 'text', nullable: true })
    comments: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }