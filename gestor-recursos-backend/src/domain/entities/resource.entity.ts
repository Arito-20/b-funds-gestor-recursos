import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn,
  } from 'typeorm';
  import { ResourceStatus } from '../enums';
  import { Manager } from './manager.entity';
  import { Provider } from './provider.entity';
  import { Initiative } from './initiative.entity';
  
  @Entity('resources')
  export class Resource {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    consultantName: string;
  
    @Column()
    providerId: number;
  
    @ManyToOne(() => Provider)
    @JoinColumn({ name: 'providerId' })
    provider: Provider;
  
    @Column()
    profile: string;
  
    @Column()
    country: string;
  
    @Column()
    currency: string;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    monthlyCostOriginal: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 4 })
    exchangeRateToUsd: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    monthlyCostUsd: number;
  
    @Column({ type: 'date' })
    startDate: string;
  
    @Column({ type: 'date' })
    endDate: string;
  
    @Column({ type: 'decimal', precision: 5, scale: 2 })
    durationMonths: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalCostUsd: number;
  
    @Column()
    analystResponsible: string;
  
    @Column()
    managerId: number;
  
    @ManyToOne(() => Manager)
    @JoinColumn({ name: 'managerId' })
    manager: Manager;
  
    @Column()
    mainInitiativeId: number;
  
    @ManyToOne(() => Initiative)
    @JoinColumn({ name: 'mainInitiativeId' })
    mainInitiative: Initiative;
  
    @Column({ type: 'text', nullable: true })
    observations: string;
  
    @Column({ type: 'simple-enum', enum: ResourceStatus, default: ResourceStatus.ACTIVE })
    status: ResourceStatus;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }