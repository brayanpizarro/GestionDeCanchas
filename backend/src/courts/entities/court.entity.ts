import { Reservation } from '../../reservations/entities/reservation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Court {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column()
    type!: string;

    @Column()
    capacity!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    pricePerHour!: number;

    @Column({ type: 'float', default: 4.5 })
    rating!: number;    @Column({
        type: 'enum',
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    })
    status!: string;

    @Column({ type: 'text', nullable: true })
    image?: string;

    @OneToMany(() => Reservation, (reservation) => reservation.court)
    reservations!: Reservation[];
}