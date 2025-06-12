import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Court } from '../courts/entities/court.entity';
import { User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';
import { EmailService } from '../email/email.service';
export declare class ReservationsService {
    private readonly reservationsRepository;
    private readonly courtsRepository;
    private readonly usersRepository;
    private readonly playersRepository;
    private readonly emailService;
    constructor(reservationsRepository: Repository<Reservation>, courtsRepository: Repository<Court>, usersRepository: Repository<User>, playersRepository: Repository<Player>, emailService: EmailService);
    create(rawDto: unknown): Promise<Reservation>;
    private calculateAmount;
    findAll(): Promise<Reservation[]>;
    getTotalCount(): Promise<number>;
    findByUser(userId: number): Promise<Reservation[]>;
    findOne(id: number): Promise<Reservation>;
    updateStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Reservation>;
    getAvailableTimeSlots(courtId: number, date: string): Promise<Array<{
        startTime: Date;
        endTime: Date;
    }>>;
}
