import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    DeleteDateColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { UserRole } from './user-role.enum';



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
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }
  