import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Court } from '../../courts/entities/court.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Reservation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'timestamp' })
    startTime!: Date;

    @Column({ type: 'timestamp' })
    endTime!: Date;

    @Column({
        type: 'enum',
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    })
    status!: 'pending' | 'confirmed' | 'completed' | 'cancelled';

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @ManyToOne(() => Court, court => court.reservations)
    court!: Court;

    @ManyToOne(() => User)
    user!: User;
}