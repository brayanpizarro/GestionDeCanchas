import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Court } from './entities/court.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService {  // Added 'export' keyword here
    constructor(
        @InjectRepository(Court)
        private courtsRepository: Repository<Court>,
        @InjectRepository(Reservation)
        private reservationsRepository: Repository<Reservation>
    ) {}

    async create(createCourtDto: CreateCourtDto): Promise<Court> {
        const court = this.courtsRepository.create({
            ...createCourtDto,
            rating: 4.5, // Valor por defecto
        });
        return await this.courtsRepository.save(court);
    }

    async findAll(): Promise<Court[]> {
        return await this.courtsRepository.find();
    }

    async getRecentReservations(): Promise<Reservation[]> {
        return this.reservationsRepository.find({
            relations: ['court', 'user'],
            order: { createdAt: 'DESC' },
            take: 5
        });
    }

    async findOne(id: number): Promise<Court> {
        const court = await this.courtsRepository.findOne({ where: { id } });
        if (!court) {
            throw new NotFoundException(`Court with ID ${id} not found`);
        }
        return court;
    }

    async update(id: number, updateCourtDto: UpdateCourtDto): Promise<Court> {
        const court = await this.findOne(id);
        this.courtsRepository.merge(court, updateCourtDto);
        return await this.courtsRepository.save(court);
    }

    async remove(id: number): Promise<void> {
        const court = await this.findOne(id);
        await this.courtsRepository.remove(court);
    }

    async getReservationsForDate(date: Date): Promise<Reservation[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.reservationsRepository.find({
            where: {
                startTime: Between(startOfDay, endOfDay)
            },
            relations: ['court', 'user']
        });
    }

    async getRecentBookings() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const reservations = await this.reservationsRepository.find({
            where: {
                startTime: Between(sevenDaysAgo, new Date())
            },
            relations: ['court', 'user'],
            order: {
                startTime: 'DESC'
            },
            take: 10
        });

        return reservations.map(res => ({
            id: res.id.toString(),
            courtName: res.court?.name || 'Sin cancha',
            userName: res.user?.name || 'Sin usuario',
            date: res.startTime,
            status: res.status || 'pending',
            amount: Number(res.amount) || 0
        }));
    }

    async getCourtUsage(): Promise<{ id: string; name: string; totalHours: number; usagePercentage: number; reservationsCount: number; revenue: number }[]> {
        const courts = await this.courtsRepository.find({
            relations: ['reservations'],
        });

        return courts.map((court) => {
            const totalSlots = 14 * 12; // 14 días * 12 horas por día
            const reservedSlots = court.reservations?.length || 0;
            const usage = (reservedSlots / totalSlots) * 100;
            const revenue = court.reservations?.reduce((sum, res) => sum + (Number(res.amount) || 0), 0) || 0;

            return {
                id: court.id.toString(),
                name: court.name,
                totalHours: reservedSlots,
                usagePercentage: Math.min(100, Math.round(usage)),
                reservationsCount: reservedSlots,
                revenue: revenue
            };
        });
    }

    async getStats() {
        const courts = await this.findAll();
        const available = courts.filter(court => court.status === 'available');
        const maintenance = courts.filter(court => court.status === 'maintenance');
        const occupied = courts.filter(court => court.status === 'occupied');
        
        const courtsWithReservations = await this.courtsRepository.find({
            relations: ['reservations'],
        });
        const totalReservations = courtsWithReservations.reduce(
            (sum, court) => sum + (court.reservations?.length || 0), 
            0
        );

        return {
            total: courts.length,
            available: available.length,
            underMaintenance: maintenance.length,
            occupied: occupied.length,
            totalReservations,
            averageRating: parseFloat((courts.reduce((acc, court) => acc + court.rating, 0) / courts.length).toFixed(1))
        };
    }
}