import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Manager } from './manager.entity';

@Entity('initiatives')
export class Initiative {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  mainCountry: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  budgetUsd: number;

  @Column({ nullable: true })
  ownerManagerId: number;

  @ManyToOne(() => Manager, { nullable: true })
  @JoinColumn({ name: 'ownerManagerId' })
  ownerManager: Manager;

  @CreateDateColumn()
  createdAt: Date;
}