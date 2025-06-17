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
import { ProductsService } from '../products/products.service';
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
        private readonly emailService: EmailService,
        private readonly productsService: ProductsService
    ) {}

    async create(rawDto: unknown): Promise<Reservation> {
        // Transform and validate the DTO
        const dto = plainToInstance(CreateReservationDto, rawDto, {
            excludeExtraneousValues: true,
        });

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

        const { courtId, userId, startTime, endTime, players, equipment } = dto;

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

        console.log('💰 Monto calculado para la reserva:', amount);

        // Validar y procesar equipamiento si existe
        let equipmentCost = 0;
        if (equipment && equipment.length > 0) {
            console.log('🎾 Procesando equipamiento:', equipment);
            
            // Verificar stock disponible antes de proceder
            for (const item of equipment) {
                const product = await this.productsService.findOne(parseInt(item.id));
                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}, solicitado: ${item.quantity}`
                    );
                }
                equipmentCost += item.price * item.quantity;
            }
            
            console.log('💰 Costo total del equipamiento:', equipmentCost);
        }

        const reservation = this.reservationsRepository.create({
            startTime: startDate,
            endTime: endDate,
            status: 'pending',
            amount: amount + equipmentCost,
            equipment: equipment || null,
            court,
            user,
        });

        // Save the reservation first to get the ID
        const savedReservation = await this.reservationsRepository.save(reservation);
        
        console.log('💾 Reserva guardada con monto:', savedReservation.amount);

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

        // Reducir stock del equipamiento solo DESPUÉS de que todo esté guardado exitosamente
        if (equipment && equipment.length > 0) {
            try {
                console.log('📦 Reduciendo stock del equipamiento...');
                for (const item of equipment) {
                    await this.productsService.reduceStock(parseInt(item.id), item.quantity);
                    console.log(`✅ Stock reducido para ${item.name}: ${item.quantity} unidades`);
                }
            } catch (error) {
                console.error('❌ Error reduciendo stock del equipamiento:', error);
                // Si falla la reducción de stock, eliminar la reserva para mantener consistencia
                await this.reservationsRepository.remove(savedReservation);
                throw new BadRequestException('Error procesando el equipamiento. Reserva cancelada.');
            }
        }

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
        
        console.log('🧮 Calculando monto de reserva:');
        console.log('   Cancha:', court.name);
        console.log('   Precio por hora:', court.pricePerHour);
        console.log('   Hora inicio:', start.toISOString());
        console.log('   Hora fin:', end.toISOString());
        console.log('   Duración (horas):', hours);
        
        // Validar que el precio por hora existe
        if (!court.pricePerHour || court.pricePerHour <= 0) {
            console.error('❌ ERROR: La cancha no tiene un precio por hora válido');
            throw new BadRequestException(`La cancha "${court.name}" no tiene un precio por hora configurado`);
        }
        
        const amount = Number(court.pricePerHour) * hours;
        console.log('   Monto calculado:', amount);
        
        return amount;
    }

    async findAll(): Promise<Reservation[]> {
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
        
        // Convertir amount de string a number
        return reservations.map(reservation => ({
            ...reservation,
            amount: Number(reservation.amount)
        }));
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

        // Convertir amount de string a number
        return reservations.map(reservation => ({
            ...reservation,
            amount: Number(reservation.amount)
        }));
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

        // Convertir amount de string a number
        reservation.amount = Number(reservation.amount);
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

        // Si se cancela la reserva, enviar email de notificación y restaurar stock
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            try {
                // Restaurar stock del equipamiento si había alguno
                if (reservation.equipment && reservation.equipment.length > 0) {
                    console.log('🔄 Restaurando stock del equipamiento cancelado...');
                    for (const item of reservation.equipment) {
                        try {
                            await this.productsService.restoreStock(parseInt(item.id), item.quantity);
                            console.log(`✅ Stock restaurado para ${item.name}: +${item.quantity} unidades`);
                        } catch (error) {
                            console.error(`❌ Error restaurando stock para ${item.name}:`, error);
                        }
                    }
                }

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

    async cancelReservation(id: number): Promise<Reservation> {
        const reservation = await this.reservationsRepository.findOne({
            where: { id },
            relations: ['court', 'user']
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Verificar si la reserva ya está cancelada
        if (reservation.status === 'cancelled') {
            throw new BadRequestException('Reservation is already cancelled');
        }

        // Actualizar el estado de la reserva
        reservation.status = 'cancelled';
        const updatedReservation = await this.reservationsRepository.save(reservation);

        // Notificar por email al usuario si está configurado
        try {            if (reservation.user && reservation.user.email) {
                await this.emailService.sendReservationCancellation(
                    reservation.user.email,
                    reservation.user.name,
                    {
                        id: reservation.id,
                        courtName: reservation.court.name,
                        date: reservation.startTime.toISOString().split('T')[0],
                        startTime: reservation.startTime.toISOString(),
                        endTime: reservation.endTime.toISOString()
                    }
                );
            }
        } catch (error) {
            console.error('Error sending cancellation email:', error);
            // No lanzamos el error para que no afecte la cancelación
        }

        return updatedReservation;
    }

    /**
     * Obtiene los horarios disponibles para una cancha específica en una fecha dada
     */
    async getAvailableTimeSlots(courtId: number, date: string): Promise<any[]> {
        // Crear la fecha de manera más explícita para evitar problemas de zona horaria
        const [year, month, day] = date.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day); // month - 1 porque en JS los meses van de 0 a 11
        
        const startOfDay = new Date(baseDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(baseDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Buscar todas las reservas confirmadas y pendientes para esta cancha en la fecha
        const existingReservations = await this.reservationsRepository.find({
            where: {
                courtId,
                status: In(['confirmed', 'pending']),
                startTime: Between(startOfDay, endOfDay)
            },
            order: { startTime: 'ASC' }
        });

        // Generar horarios disponibles explícitamente
        const timeSlots: any[] = [];
        
        // Definir horarios específicos para evitar problemas con decimales
        const scheduleSlots = [
            { hour: 8, minute: 0 },   // 08:00 - 09:30
            { hour: 9, minute: 30 },  // 09:30 - 11:00
            { hour: 11, minute: 0 },  // 11:00 - 12:30
            { hour: 12, minute: 30 }, // 12:30 - 14:00
            { hour: 14, minute: 0 },  // 14:00 - 15:30
            { hour: 15, minute: 30 }, // 15:30 - 17:00
        ];
        
        for (const slot of scheduleSlots) {
            const startTime = new Date(Date.UTC(
                baseDate.getFullYear(), 
                baseDate.getMonth(), 
                baseDate.getDate(), 
                slot.hour, 
                slot.minute, 
                0, 
                0
            ));
            
            const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // 90 minutos después
            
            // Verificar si este horario tiene conflictos
            const hasConflict = existingReservations.some(reservation => {
                const resStart = new Date(reservation.startTime);
                const resEnd = new Date(reservation.endTime);
                return (startTime < resEnd && endTime > resStart);
            });
            
            timeSlots.push({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                available: !hasConflict
            });
        }

        return timeSlots;
    }

    /**
     * Verifica si una cancha está disponible en un horario específico
     */
    async isCourtAvailable(courtId: number, startTime: Date, endTime: Date): Promise<boolean> {
        const conflictingReservations = await this.reservationsRepository.createQueryBuilder('reservation')
            .where('reservation.courtId = :courtId', { courtId })
            .andWhere('reservation.status IN (:...statuses)', { statuses: ['confirmed', 'pending'] })
            .andWhere(
                '(reservation.startTime < :endTime AND reservation.endTime > :startTime)',
                { startTime, endTime }
            )
            .getCount();

        return conflictingReservations === 0;
    }

    /**
     * Get detailed reservation statistics by court including cancelled reservations
     */
    async getDetailedReservationStats(): Promise<any[]> {
        try {
            console.log('🔍 Starting getDetailedReservationStats...');
            
            // Primero verificamos que las tablas existan
            console.log('🏟️ Fetching courts...');
            const courts = await this.courtsRepository.find();
            console.log(`✅ Found ${courts.length} courts:`, courts.map(c => ({ id: c.id, name: c.name })));
            
            if (courts.length === 0) {
                console.log('⚠️ No courts found, returning empty stats');
                return [];
            }
            
            // Para cada cancha, calculamos sus estadísticas
            console.log('📊 Calculating stats for each court...');
            const stats = await Promise.all(
                courts.map(async (court) => {
                    try {
                        console.log(`🔍 Processing court: ${court.name} (ID: ${court.id})`);
                        
                        const reservations = await this.reservationsRepository
                            .createQueryBuilder('reservation')
                            .where('reservation.courtId = :courtId', { courtId: court.id })
                            .getMany();

                        console.log(`📋 Court ${court.name} has ${reservations.length} reservations`);

                        const activeCount = reservations.filter(r => 
                            ['confirmed', 'completed', 'pending'].includes(r.status)
                        ).length;
                        
                        const cancelledCount = reservations.filter(r => 
                            r.status === 'cancelled'
                        ).length;
                        
                        const completedCount = reservations.filter(r => 
                            r.status === 'completed'
                        ).length;
                        
                        const revenue = reservations
                            .filter(r => ['confirmed', 'completed'].includes(r.status))
                            .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

                        const courtStat = {
                            courtId: court.id,
                            court: court.name,
                            reservations: activeCount,
                            cancelled: cancelledCount,
                            completed: completedCount,
                            revenue: revenue
                        };
                        
                        console.log(`✅ Court ${court.name} stats:`, courtStat);
                        return courtStat;
                        
                    } catch (courtError) {
                        console.error(`❌ Error processing court ${court.name}:`, courtError);
                        // Return default stats for this court instead of failing completely
                        return {
                            courtId: court.id,
                            court: court.name,
                            reservations: 0,
                            cancelled: 0,
                            completed: 0,
                            revenue: 0
                        };
                    }
                })
            );

            console.log('🎉 Final stats calculated:', stats);
            return stats;

        } catch (error) {
            console.error('💥 Critical error in getDetailedReservationStats:', error);
            console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
            // Instead of returning empty array, throw the error so we can see what's wrong
            throw new Error(`Failed to get court stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
