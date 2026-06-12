import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  rateToUsd: number;

  @Column({ type: 'date' })
  rateDate: string;

  @Column({ default: 'manual' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;
}