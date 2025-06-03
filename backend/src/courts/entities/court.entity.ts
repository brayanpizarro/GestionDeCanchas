import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity()
export class Court {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    location: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    pricePerHour: number;

    @Column({ default: 'available' })
    status: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    capacity: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 4.5 })
    rating: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => Reservation, reservation => reservation.court)
    reservations: Reservation[];
}