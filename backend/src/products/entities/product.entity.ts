import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column()
    stock: number;

    @Column()
    category: string;

    @Column({ default: true })
    available: boolean;    @Column({ nullable: true })
    imagePath: string;

    @Column({ nullable: true })
    previousStock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}