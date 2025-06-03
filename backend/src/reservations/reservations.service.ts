import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Court } from '../courts/entities/court.entity';
import { User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationsRepository: Repository<Reservation>,
        @InjectRepository(Court)
        private readonly courtsRepository: Repository<Court>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>
    ) {}

    async create(rawDto: unknown): Promise<Reservation> {
        // Transform and validate the DTO
        const dto = plainToInstance(CreateReservationDto, rawDto, {
            excludeExtraneousValues: true,
        });

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
            throw new BadRequestException('Invalid reservation data');
        }

        const { courtId, userId, startTime, endTime, players } = dto;

        const court = await this.courtsRepository.findOneBy({ id: courtId });
        if (!court) {
            throw new NotFoundException(`Court with ID ${courtId} not found`);
        }

        // Verify that the number of players does not exceed the court's capacity
        if (players.length > court.capacity) {
            throw new BadRequestException(`The number of players exceeds the court's maximum capacity (${court.capacity})`);
        }

        const user = await this.usersRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        // Check for existing reservations
        const existingReservation = await this.reservationsRepository.findOne({
            where: {
                court: { id: courtId },
                startTime: Between(startDate, endDate),
                status: 'confirmed',
            },
            relations: ['court'],
        });

        if (existingReservation) {
            throw new BadRequestException('This court is already reserved for the specified time');
        }

        const amount = this.calculateAmount(court, startTime, endTime);

        const reservation = this.reservationsRepository.create({
            startTime: startDate,
            endTime: endDate,
            status: 'pending',
            amount,
            court,
            user,
        });

        // Save the reservation first to get the ID
        const savedReservation = await this.reservationsRepository.save(reservation);

        // Create and save the players
        const playerEntities = players.map(playerDto => {
            return this.playersRepository.create({
                ...playerDto,
                reservation: savedReservation,
            });
        });

        savedReservation.players = await this.playersRepository.save(playerEntities);

        return await this.reservationsRepository.save(savedReservation);
    }

    private calculateAmount(court: Court, startTime: string, endTime: string): number {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return court.pricePerHour * hours;
    }

    async findAll(): Promise<Reservation[]> {
        return await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
    }

    async findByUser(userId: number): Promise<Reservation[]> {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new BadRequestException('Invalid user ID');
        }

        return await this.reservationsRepository.find({
            where: { user: { id: userId } },
            relations: ['court', 'players'],
            order: { startTime: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Reservation> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('Invalid reservation ID');
        }

        const reservation = await this.reservationsRepository.findOne({
            where: { id },
            relations: ['court', 'user', 'players'],
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        return reservation;
    }

    async updateStatus(
        id: number,
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    ): Promise<Reservation> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new BadRequestException('Invalid reservation ID');
        }

        if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            throw new BadRequestException('Invalid status');
        }

        const reservation = await this.findOne(id);
        reservation.status = status;
        return await this.reservationsRepository.save(reservation);
    }

    async getAvailableTimeSlots(
        courtId: number,
        date: string
    ): Promise<Array<{ startTime: Date; endTime: Date }>> {
        if (!Number.isInteger(courtId) || courtId <= 0) {
            throw new BadRequestException('Invalid court ID');
        }

        if (typeof date !== 'string' || !date) {
            throw new BadRequestException('Invalid date');
        }

        const court = await this.courtsRepository.findOneBy({ id: courtId });
        if (!court) {
            throw new NotFoundException(`Court with ID ${courtId} not found`);
        }

        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
            throw new BadRequestException('Invalid date format');
        }

        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservations = await this.reservationsRepository.find({
            where: {
                court: { id: courtId },
                startTime: Between(startOfDay, endOfDay),
                status: 'confirmed',
            },
            order: { startTime: 'ASC' },
        });

        const availableTimeSlots: Array<{ startTime: Date; endTime: Date }> = [];
        const slotDuration = 60; // duration in minutes

        const openingTime = new Date(date);
        openingTime.setHours(8, 0, 0, 0);

        const closingTime = new Date(date);
        closingTime.setHours(22, 0, 0, 0);

        let currentSlot = new Date(openingTime);

        while (currentSlot < closingTime) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

            const isAvailable = !reservations.some(reservation => {
                return (currentSlot >= reservation.startTime && currentSlot < reservation.endTime) ||
                    (slotEnd > reservation.startTime && slotEnd <= reservation.endTime);
            });

            if (isAvailable) {
                availableTimeSlots.push({
                    startTime: new Date(currentSlot),
                    endTime: new Date(slotEnd),
                });
            }

            currentSlot = new Date(slotEnd);
        }

        return availableTimeSlots;
    }
}
