import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../enums';
import { Manager } from './manager.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.MANAGER })
  role: UserRole;

  @Column({ nullable: true })
  managerId: number;

  @ManyToOne(() => Manager, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: Manager;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}