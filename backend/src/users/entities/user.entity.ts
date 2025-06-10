import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    DeleteDateColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
  } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Card } from '../../card/entities/card.entity';



  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;

    @Column({
      type: 'enum',
      enum: ['active', 'inactive'],
      default: 'active'
    })
    status: 'active' | 'inactive';

    @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.USER,
    })
    role: UserRole;
  
    @Column({ type: 'varchar', length: 36, nullable: true })
    resetToken: string | null;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Reservation, reservation => reservation.user)
    reservations: Reservation[];

    @Column({ type: 'float', default: 0 })
    balance: number;
    
    @OneToMany(() => Card, card => card.user)
    cards: Card[];
  }
