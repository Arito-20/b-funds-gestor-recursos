import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  area: string;

  @CreateDateColumn()
  createdAt: Date;
}