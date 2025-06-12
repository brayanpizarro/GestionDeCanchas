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
import { EmailService } from '../email/email.service';

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
        private readonly playersRepository: Repository<Player>,
        private readonly emailService: EmailService
    ) {}

    async create(rawDto: unknown): Promise<Reservation> {
        console.log('Raw DTO received:', rawDto);
        
        // Transform and validate the DTO
        const dto = plainToInstance(CreateReservationDto, rawDto, {
            excludeExtraneousValues: true,
        });

        console.log('Transformed DTO:', dto);

        const validationErrors = await validate(dto);
        if (validationErrors.length > 0) {
            console.error('Validation errors:', validationErrors.map(err => ({
                property: err.property,
                constraints: err.constraints
            })));
            throw new BadRequestException({
                message: 'Invalid reservation data',
                errors: validationErrors.map(err => ({
                    property: err.property,
                    constraints: err.constraints
                }))
            });
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

        const finalReservation = await this.reservationsRepository.save(savedReservation);

        // Enviar email de confirmación
        try {
            const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // duración en minutos
            await this.emailService.sendReservationConfirmation(
                user.email,
                user.name,
                {
                    id: finalReservation.id,
                    courtName: court.name,
                    date: startDate.toISOString(),
                    startTime: startDate.toISOString(),
                    endTime: endDate.toISOString(),
                    duration: Math.round(duration),
                    players: players.map(p => `${p.firstName} ${p.lastName}`)
                }
            );
        } catch (emailError) {
            console.error('Error enviando email de confirmación:', emailError);
            // No lanzamos el error para no afectar la creación de la reserva
        }

        return finalReservation;
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

    async getTotalCount(): Promise<number> {
        return await this.reservationsRepository.count();
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
        const reservation = await this.reservationsRepository.findOne({
            where: { id },
            relations: ['court', 'user', 'players'],
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        const oldStatus = reservation.status;
        reservation.status = status;
        
        const updatedReservation = await this.reservationsRepository.save(reservation);

        // Si se cancela la reserva, enviar email de notificación
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            try {
                await this.emailService.sendReservationCancellation(
                    reservation.user.email,
                    reservation.user.name,
                    {
                        id: reservation.id,
                        courtName: reservation.court.name,
                        date: reservation.startTime.toISOString(),
                        startTime: reservation.startTime.toISOString(),
                        endTime: reservation.endTime.toISOString(),
                        cancellationReason: 'Cancelación solicitada por el usuario'
                    }
                );
            } catch (emailError) {
                console.error('Error enviando email de cancelación:', emailError);
            }
        }

        return updatedReservation;
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
