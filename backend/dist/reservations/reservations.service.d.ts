import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Court } from '../courts/entities/court.entity';
import { User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
export declare class ReservationsService {
    private readonly reservationsRepository;
    private readonly courtsRepository;
    private readonly usersRepository;
    private readonly playersRepository;
    private readonly usersService;
    private readonly emailService;
    constructor(reservationsRepository: Repository<Reservation>, courtsRepository: Repository<Court>, usersRepository: Repository<User>, playersRepository: Repository<Player>, usersService: UsersService, emailService: EmailService);
    create(rawDto: unknown): Promise<Reservation>;
    processPayment(reservationId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private calculateAmount;
    findAll(): Promise<Reservation[]>;
    findAllWithDeleted(): Promise<Reservation[]>;
    getTotalCount(): Promise<number>;
    findByUser(userId: number): Promise<Reservation[]>;
    findOne(id: number): Promise<Reservation>;
    updateStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<Reservation>;
    getAvailableTimeSlots(courtId: number, date: string): Promise<{
        available: string[];
        reserved: string[];
    }>;
    isCourtAvailable(courtId: number, startTime: Date, endTime: Date): Promise<boolean>;
}
