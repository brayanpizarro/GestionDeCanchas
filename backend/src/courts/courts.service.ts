import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Court } from './entities/court.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService {
    private readonly logger = new Logger(CourtsService.name);
    
    constructor(
        @InjectRepository(Court)
        private courtsRepository: Repository<Court>,
        @InjectRepository(Reservation)
        private reservationsRepository: Repository<Reservation>
    ) {}

    /**
     * Normaliza la ruta de imagen para evitar duplicaciones y caracteres problemáticos
     */
    private normalizeImagePath(imagePath: string): string {
        if (!imagePath) return '';
        
        // Remover cualquier prefijo /uploads/ al inicio
        let cleanPath = imagePath.replace(/^\/+uploads\/+/g, '');
        
        // Si la ruta comienza con uploads/ (sin barra inicial), también removerlo
        cleanPath = cleanPath.replace(/^uploads\/+/g, '');
        
        // Construir la ruta final
        const finalPath = `/uploads/${cleanPath}`;
        
        this.logger.debug(`Normalized image path: ${imagePath} -> ${finalPath}`);
        return finalPath;
    }

    async create(createCourtDto: CreateCourtDto): Promise<Court> {
        this.logger.log('Creating court with data:', {
            ...createCourtDto,
            hasImagePath: !!createCourtDto.imagePath
        });

        const court = this.courtsRepository.create({
            ...createCourtDto,
            rating: 4.5, // Valor por defecto
            isCovered: createCourtDto.isCovered ?? (createCourtDto.type === 'covered'), // Auto-derivar del tipo si no se especifica
        });
        
        const savedCourt = await this.courtsRepository.save(court);
        
        this.logger.log('Court saved successfully:', {
            id: savedCourt.id,
            name: savedCourt.name,
            imagePath: savedCourt.imagePath,
            hasImagePath: !!savedCourt.imagePath
        });
        
        // Return court with normalized imageUrl for frontend compatibility
        const result = savedCourt as Court & { imageUrl?: string };
        result.imageUrl = savedCourt.imagePath ? this.normalizeImagePath(savedCourt.imagePath) : undefined;
        return result;
    }

    async findAll(): Promise<Court[]> {
        const courts = await this.courtsRepository.find();
        
        // Add imageUrl property for frontend compatibility
        return courts.map(court => {
            const result = court as Court & { imageUrl?: string };
            result.imageUrl = court.imagePath ? this.normalizeImagePath(court.imagePath) : undefined;
            return result;
        });
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
        
        // Add imageUrl property for frontend compatibility
        const result = court as Court & { imageUrl?: string };
        result.imageUrl = court.imagePath ? this.normalizeImagePath(court.imagePath) : undefined;
        return result;
    }

    async updateStatus(id: number, status: string): Promise<Court> {
        const court = await this.findOne(id);
        court.status = status;
        return await this.courtsRepository.save(court);
    }

    async update(id: number, updateCourtDto: UpdateCourtDto): Promise<Court> {
        const court = await this.findOne(id);
        this.courtsRepository.merge(court, updateCourtDto);
        const savedCourt = await this.courtsRepository.save(court);
        
        // Return court with normalized imageUrl for frontend compatibility
        const result = savedCourt as Court & { imageUrl?: string };
        result.imageUrl = savedCourt.imagePath ? this.normalizeImagePath(savedCourt.imagePath) : undefined;
        return result;
    }

    async remove(id: number): Promise<void> {
        const court = await this.findOne(id);
        
        // Primero verificamos si hay reservaciones asociadas
        const reservations = await this.reservationsRepository.find({
            where: { court: { id: court.id } }
        });

        if (reservations.length > 0) {
            throw new Error('No se puede eliminar la cancha porque tiene reservaciones asociadas');
        }

        // Si no hay reservaciones, procedemos a eliminar la cancha
        try {
            await this.courtsRepository.remove(court);
        } catch (error) {
            console.error('Error al eliminar la cancha:', error);
            throw new Error('Error al eliminar la cancha');
        }
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