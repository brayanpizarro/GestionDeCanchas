import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    rut: string;

    @Column()
    age: number;

    @ManyToOne(() => Reservation, reservation => reservation.players)
    reservation: Reservation;
}
