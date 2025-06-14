import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Court } from '../courts/entities/court.entity';
import { User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { cleanRut, getRutErrorMessage } from '../utils/rutValidator';

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
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
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

        // Check for existing reservations that could conflict
        // We need to check for any overlap, not just exact matches
        const conflictingReservations = await this.reservationsRepository.createQueryBuilder('reservation')
            .where('reservation.courtId = :courtId', { courtId })
            .andWhere('reservation.status IN (:...statuses)', { statuses: ['confirmed', 'pending'] })
            .andWhere(
                '(reservation.startTime < :endTime AND reservation.endTime > :startTime)',
                { startTime: startDate, endTime: endDate }
            )
            .getMany();

        if (conflictingReservations.length > 0) {
            const conflictDetails = conflictingReservations.map(res => {
                const status = res.status === 'confirmed' ? 'CONFIRMADA' : 'PENDIENTE';
                return `${res.startTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - ${res.endTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} (${status})`;
            }).join(', ');
            
            throw new BadRequestException(
                `❌ HORARIO NO DISPONIBLE: Esta cancha ya tiene reservas que se superponen con el horario solicitado. ` +
                `Esto evita conflictos y disputas entre usuarios. ` +
                `Reservas existentes: ${conflictDetails}. ` +
                `Por favor, selecciona otro horario disponible.`
            );
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

        // Validate RUTs and check for duplicates
        const rutSet = new Set<string>();
        for (const playerDto of players) {
            // Validar el RUT
            const rutError = getRutErrorMessage(playerDto.rut);
            if (rutError) {
                throw new BadRequestException(`RUT inválido para el jugador ${playerDto.firstName} ${playerDto.lastName}: ${rutError}`);
            }

            // Verificar RUTs duplicados
            const cleanedRut = cleanRut(playerDto.rut);
            if (rutSet.has(cleanedRut)) {
                throw new BadRequestException(`RUT duplicado: ${playerDto.rut}`);
            }
            rutSet.add(cleanedRut);
        }

        // Create and save the players
        const playerEntities = players.map(playerDto => {
            return this.playersRepository.create({
                ...playerDto,
                reservation: savedReservation,
            });
        });

        savedReservation.players = await this.playersRepository.save(playerEntities);

        const finalReservation = await this.reservationsRepository.save(savedReservation);

        return finalReservation;
    }

    async processPayment(reservationId: number, userId: number): Promise<{ success: boolean; message: string }> {
        // Buscar la reserva con todas las relaciones necesarias
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId },
            relations: ['user', 'court', 'players']
        });

        if (!reservation) {
            throw new NotFoundException('Reserva no encontrada');
        }

        if (reservation.userId !== userId) {
            throw new BadRequestException('No tienes permiso para pagar esta reserva');
        }

        if (reservation.status !== 'pending') {
            throw new BadRequestException('Esta reserva ya ha sido procesada');
        }

        const amount = parseFloat(reservation.amount.toString());

        try {
            // Deducir saldo del usuario
            await this.usersService.deductBalance(userId, amount);

            // Actualizar estado de la reserva
            reservation.status = 'confirmed';
            const confirmedReservation = await this.reservationsRepository.save(reservation);

            // Enviar email de confirmación DESPUÉS del pago exitoso
            try {
                const duration = (reservation.endTime.getTime() - reservation.startTime.getTime()) / (1000 * 60);
                await this.emailService.sendReservationConfirmation(
                    reservation.user.email,
                    reservation.user.name,
                    {
                        id: confirmedReservation.id,
                        courtName: reservation.court.name,
                        date: reservation.startTime.toISOString(),
                        startTime: reservation.startTime.toISOString(),
                        endTime: reservation.endTime.toISOString(),
                        duration: Math.round(duration),
                        players: reservation.players.map(p => `${p.firstName} ${p.lastName}`)
                    }
                );
                console.log('Email de confirmación enviado tras pago exitoso');
            } catch (emailError) {
                console.error('Error enviando email de confirmación:', emailError);
                // No lanzamos el error para no afectar el flujo de pago
            }

            return {
                success: true,
                message: 'Pago procesado exitosamente y confirmación enviada'
            };
        } catch (error) {
            if (error instanceof Error && error.message === 'Saldo insuficiente') {
                return {
                    success: false,
                    message: 'Saldo insuficiente para procesar el pago'
                };
            }
            throw error;
        }
    }

    private calculateAmount(court: Court, startTime: string, endTime: string): number {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return court.pricePerHour * hours;
    }

    async findAll(): Promise<Reservation[]> {
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
        return reservations;
    }

    async findAllWithDeleted(): Promise<Reservation[]> {
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
            withDeleted: true, // Incluir registros con deletedAt no nulo
        });
        return reservations;
    }

    async getTotalCount(): Promise<number> {
        return await this.reservationsRepository.count();
    }

    async findByUser(userId: number): Promise<Reservation[]> {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new BadRequestException('Invalid user ID');
        }

        const reservations = await this.reservationsRepository.find({
            where: { user: { id: userId } },
            relations: ['court', 'players'],
            order: { startTime: 'DESC' },
        });

        // Debug: log de las reservas para verificar los datos
        console.log('📋 Reservations found for user:', userId);
        reservations.forEach((res, index) => {
            console.log(`Reservation ${index + 1}:`, {
                id: res.id,
                startTime: res.startTime,
                endTime: res.endTime,
                amount: res.amount,
                status: res.status,
                court: res.court?.name
            });
        });

        return reservations;
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
                // TODO: Implementar función de cancelación en email utils
                console.log('Reserva cancelada - email de notificación pendiente');
                /*
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
                */
            } catch (emailError) {
                console.error('Error enviando email de cancelación:', emailError);
            }
        }

        return updatedReservation;
    }

    async getAvailableTimeSlots(
        courtId: number,
        date: string,
        duration: number = 90
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
                status: In(['confirmed', 'pending']), // Incluir tanto confirmadas como pendientes
            },
            order: { startTime: 'ASC' },
        });

        const availableTimeSlots: Array<{ startTime: Date; endTime: Date }> = [];
        const requestedDuration = duration; // duración solicitada por el usuario en minutos
        const slotInterval = 30; // intervalo entre slots posibles (30 minutos)

        const openingTime = new Date(date);
        openingTime.setHours(8, 0, 0, 0);

        const closingTime = new Date(date);
        closingTime.setHours(18, 0, 0, 0);

        let currentSlot = new Date(openingTime);

        while (currentSlot < closingTime) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + requestedDuration);

            // Verificar que no exceda el horario de cierre
            if (slotEnd > closingTime) {
                break;
            }

            // Verificar que todo el período de la duración solicitada esté disponible
            const isAvailable = !reservations.some(reservation => {
                // Verificar si hay algún conflicto en todo el período solicitado
                return (currentSlot < reservation.endTime && slotEnd > reservation.startTime);
            });

            if (isAvailable) {
                availableTimeSlots.push({
                    startTime: new Date(currentSlot),
                    endTime: new Date(slotEnd),
                });
            }

            // Avanzar en intervalos de 30 minutos para permitir más opciones
            currentSlot = new Date(currentSlot);
            currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
        }

        return availableTimeSlots;
    }

    async getTimeSlotsWithAvailability(
        courtId: number,
        date: string
    ): Promise<Array<{ 
        startTime: Date; 
        endTime: Date; 
        isAvailable: boolean; 
        status?: 'confirmed' | 'pending';
        reservationId?: number;
    }>> {
        if (!Number.isInteger(courtId) || courtId <= 0) {
            throw new BadRequestException('Invalid court ID');
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

        // Obtener todas las reservas del día (confirmadas y pendientes)
        const reservations = await this.reservationsRepository.find({
            where: {
                court: { id: courtId },
                startTime: Between(startOfDay, endOfDay),
                status: In(['confirmed', 'pending']),
            },
            order: { startTime: 'ASC' },
        });

        const timeSlots: Array<{ 
            startTime: Date; 
            endTime: Date; 
            isAvailable: boolean; 
            status?: 'confirmed' | 'pending';
            reservationId?: number;
        }> = [];

        const slotDuration = 60; // duración en minutos
        const openingTime = new Date(date);
        openingTime.setHours(8, 0, 0, 0);
        const closingTime = new Date(date);
        closingTime.setHours(18, 0, 0, 0);

        let currentSlot = new Date(openingTime);

        while (currentSlot < closingTime) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

            // Buscar si hay una reserva que ocupe este horario
            const conflictingReservation = reservations.find(reservation => {
                return (currentSlot >= reservation.startTime && currentSlot < reservation.endTime) ||
                    (slotEnd > reservation.startTime && slotEnd <= reservation.endTime) ||
                    (currentSlot <= reservation.startTime && slotEnd >= reservation.endTime);
            });

            if (conflictingReservation) {
                timeSlots.push({
                    startTime: new Date(currentSlot),
                    endTime: new Date(slotEnd),
                    isAvailable: false,
                    status: conflictingReservation.status as 'confirmed' | 'pending',
                    reservationId: conflictingReservation.id,
                });
            } else {
                timeSlots.push({
                    startTime: new Date(currentSlot),
                    endTime: new Date(slotEnd),
                    isAvailable: true,
                });
            }

            currentSlot = new Date(slotEnd);
        }

        return timeSlots;
    }

    async cancelReservation(reservationId: number, reason?: string, isAdminCancellation: boolean = false): Promise<{ success: boolean; message: string }> {
        // Buscar la reserva con todas las relaciones necesarias
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId },
            relations: ['user', 'court', 'players']
        });

        if (!reservation) {
            throw new NotFoundException('Reserva no encontrada');
        }

        // Verificar que la reserva se puede cancelar
        if (reservation.status === 'cancelled') {
            throw new BadRequestException('Esta reserva ya está cancelada');
        }

        if (reservation.status === 'completed') {
            throw new BadRequestException('No se puede cancelar una reserva completada');
        }

        // Verificar tiempo de cancelación (solo para usuarios, admin puede cancelar siempre)
        if (!isAdminCancellation) {
            const now = new Date();
            const reservationTime = new Date(reservation.startTime);
            const timeDiff = reservationTime.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 3600);

            if (hoursDiff < 2) {
                throw new BadRequestException('No se puede cancelar la reserva con menos de 2 horas de anticipación');
            }
        }

        try {
            // Actualizar estado de la reserva
            reservation.status = 'cancelled';
            const cancelledReservation = await this.reservationsRepository.save(reservation);

            // Si la reserva estaba confirmada, devolver el dinero al usuario
            if (reservation.status === 'confirmed') {
                const amount = parseFloat(reservation.amount.toString());
                await this.usersService.addBalance(reservation.userId, amount);
                console.log(`💰 Saldo de ${amount} devuelto al usuario ${reservation.userId}`);
            }

            // Enviar email de cancelación
            try {
                const { EmailService } = await import('../email/email.service');
                const emailService = new EmailService();
                
                await emailService.sendReservationCancellation(
                    reservation.user.email,
                    reservation.user.name,
                    {
                        id: cancelledReservation.id,
                        courtName: reservation.court.name,
                        date: reservation.startTime.toISOString(),
                        startTime: reservation.startTime.toISOString(),
                        endTime: reservation.endTime.toISOString(),
                        cancellationReason: reason
                    }
                );
                console.log('✅ Email de cancelación enviado');
            } catch (emailError) {
                console.error('❌ Error enviando email de cancelación:', emailError);
                // No lanzamos el error para no afectar el flujo de cancelación
            }

            return {
                success: true,
                message: isAdminCancellation 
                    ? 'Reserva cancelada por administrador y usuario notificado'
                    : 'Reserva cancelada exitosamente y saldo reembolsado'
            };
        } catch (error) {
            console.error('Error en cancelación de reserva:', error);
            throw new BadRequestException('Error al cancelar la reserva');
        }
    }
}
