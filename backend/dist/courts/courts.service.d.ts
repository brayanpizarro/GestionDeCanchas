import { Repository } from 'typeorm';
import { Court } from './entities/court.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
export declare class CourtsService {
    private courtsRepository;
    private reservationsRepository;
    constructor(courtsRepository: Repository<Court>, reservationsRepository: Repository<Reservation>);
    create(createCourtDto: CreateCourtDto): Promise<Court>;
    findAll(): Promise<Court[]>;
    getRecentReservations(): Promise<Reservation[]>;
    findOne(id: number): Promise<Court>;
    updateStatus(id: number, status: string): Promise<Court>;
    update(id: number, updateCourtDto: UpdateCourtDto): Promise<Court>;
    remove(id: number): Promise<void>;
    getReservationsForDate(date: Date): Promise<Reservation[]>;
    getRecentBookings(): Promise<{
        id: string;
        courtName: string;
        userName: string;
        date: Date;
        status: string;
        amount: number;
    }[]>;
    getCourtUsage(): Promise<{
        id: string;
        name: string;
        totalHours: number;
        usagePercentage: number;
        reservationsCount: number;
        revenue: number;
    }[]>;
    getStats(): Promise<{
        total: number;
        available: number;
        underMaintenance: number;
        occupied: number;
        totalReservations: number;
        averageRating: number;
    }>;
}
