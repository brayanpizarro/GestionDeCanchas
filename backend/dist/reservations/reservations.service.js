"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_entity_1 = require("./entities/reservation.entity");
const court_entity_1 = require("../courts/entities/court.entity");
const user_entity_1 = require("../users/entities/user.entity");
const player_entity_1 = require("./entities/player.entity");
const create_reservation_dto_1 = require("./dto/create-reservation.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const email_service_1 = require("../email/email.service");
const users_service_1 = require("../users/users.service");
const products_service_1 = require("../products/products.service");
const rutValidator_1 = require("../utils/rutValidator");
let ReservationsService = class ReservationsService {
    reservationsRepository;
    courtsRepository;
    usersRepository;
    playersRepository;
    usersService;
    emailService;
    productsService;
    constructor(reservationsRepository, courtsRepository, usersRepository, playersRepository, usersService, emailService, productsService) {
        this.reservationsRepository = reservationsRepository;
        this.courtsRepository = courtsRepository;
        this.usersRepository = usersRepository;
        this.playersRepository = playersRepository;
        this.usersService = usersService;
        this.emailService = emailService;
        this.productsService = productsService;
    }
    async create(rawDto) {
        const dto = (0, class_transformer_1.plainToInstance)(create_reservation_dto_1.CreateReservationDto, rawDto, {
            excludeExtraneousValues: true,
        });
        const validationErrors = await (0, class_validator_1.validate)(dto);
        if (validationErrors.length > 0) {
            console.error('Validation errors:', validationErrors.map(err => ({
                property: err.property,
                constraints: err.constraints
            })));
            throw new common_1.BadRequestException({
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
            throw new common_1.NotFoundException(`Court with ID ${courtId} not found`);
        }
        if (players.length > court.capacity) {
            throw new common_1.BadRequestException(`The number of players exceeds the court's maximum capacity (${court.capacity})`);
        }
        const user = await this.usersRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        const conflictingReservations = await this.reservationsRepository.createQueryBuilder('reservation')
            .where('reservation.courtId = :courtId', { courtId })
            .andWhere('reservation.status IN (:...statuses)', { statuses: ['confirmed', 'pending'] })
            .andWhere('(reservation.startTime < :endTime AND reservation.endTime > :startTime)', { startTime: startDate, endTime: endDate })
            .getMany();
        if (conflictingReservations.length > 0) {
            const conflictDetails = conflictingReservations.map(res => {
                const status = res.status === 'confirmed' ? 'CONFIRMADA' : 'PENDIENTE';
                return `${res.startTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - ${res.endTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} (${status})`;
            }).join(', ');
            throw new common_1.BadRequestException(`❌ HORARIO NO DISPONIBLE: Esta cancha ya tiene reservas que se superponen con el horario solicitado. ` +
                `Esto evita conflictos y disputas entre usuarios. ` +
                `Reservas existentes: ${conflictDetails}. ` +
                `Por favor, selecciona otro horario disponible.`);
        }
        const amount = this.calculateAmount(court, startTime, endTime);
        console.log('💰 Monto calculado para la reserva:', amount);
        let equipmentCost = 0;
        if (equipment && equipment.length > 0) {
            console.log('🎾 Procesando equipamiento:', equipment);
            for (const item of equipment) {
                const product = await this.productsService.findOne(parseInt(item.id));
                if (product.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}, solicitado: ${item.quantity}`);
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
        const savedReservation = await this.reservationsRepository.save(reservation);
        console.log('💾 Reserva guardada con monto:', savedReservation.amount);
        const rutSet = new Set();
        for (const playerDto of players) {
            const rutError = (0, rutValidator_1.getRutErrorMessage)(playerDto.rut);
            if (rutError) {
                throw new common_1.BadRequestException(`RUT inválido para el jugador ${playerDto.firstName} ${playerDto.lastName}: ${rutError}`);
            }
            const cleanedRut = (0, rutValidator_1.cleanRut)(playerDto.rut);
            if (rutSet.has(cleanedRut)) {
                throw new common_1.BadRequestException(`RUT duplicado: ${playerDto.rut}`);
            }
            rutSet.add(cleanedRut);
        }
        const playerEntities = players.map(playerDto => {
            return this.playersRepository.create({
                ...playerDto,
                reservation: savedReservation,
            });
        });
        savedReservation.players = await this.playersRepository.save(playerEntities);
        if (equipment && equipment.length > 0) {
            try {
                console.log('📦 Reduciendo stock del equipamiento...');
                for (const item of equipment) {
                    await this.productsService.reduceStock(parseInt(item.id), item.quantity);
                    console.log(`✅ Stock reducido para ${item.name}: ${item.quantity} unidades`);
                }
            }
            catch (error) {
                console.error('❌ Error reduciendo stock del equipamiento:', error);
                await this.reservationsRepository.remove(savedReservation);
                throw new common_1.BadRequestException('Error procesando el equipamiento. Reserva cancelada.');
            }
        }
        const finalReservation = await this.reservationsRepository.save(savedReservation);
        return finalReservation;
    }
    async processPayment(reservationId, userId) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId },
            relations: ['user', 'court', 'players']
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        if (reservation.userId !== userId) {
            throw new common_1.BadRequestException('No tienes permiso para pagar esta reserva');
        }
        if (reservation.status !== 'pending') {
            throw new common_1.BadRequestException('Esta reserva ya ha sido procesada');
        }
        const amount = parseFloat(reservation.amount.toString());
        try {
            await this.usersService.deductBalance(userId, amount);
            reservation.status = 'confirmed';
            const confirmedReservation = await this.reservationsRepository.save(reservation);
            try {
                const duration = (reservation.endTime.getTime() - reservation.startTime.getTime()) / (1000 * 60);
                await this.emailService.sendReservationConfirmation(reservation.user.email, reservation.user.name, {
                    id: confirmedReservation.id,
                    courtName: reservation.court.name,
                    date: reservation.startTime.toISOString(),
                    startTime: reservation.startTime.toISOString(),
                    endTime: reservation.endTime.toISOString(),
                    duration: Math.round(duration),
                    players: reservation.players.map(p => `${p.firstName} ${p.lastName}`)
                });
                console.log('Email de confirmación enviado tras pago exitoso');
            }
            catch (emailError) {
                console.error('Error enviando email de confirmación:', emailError);
            }
            return {
                success: true,
                message: 'Pago procesado exitosamente y confirmación enviada'
            };
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Saldo insuficiente') {
                return {
                    success: false,
                    message: 'Saldo insuficiente para procesar el pago'
                };
            }
            throw error;
        }
    }
    calculateAmount(court, startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        console.log('🧮 Calculando monto de reserva:');
        console.log('   Cancha:', court.name);
        console.log('   Precio por hora:', court.pricePerHour);
        console.log('   Hora inicio:', start.toISOString());
        console.log('   Hora fin:', end.toISOString());
        console.log('   Duración (horas):', hours);
        if (!court.pricePerHour || court.pricePerHour <= 0) {
            console.error('❌ ERROR: La cancha no tiene un precio por hora válido');
            throw new common_1.BadRequestException(`La cancha "${court.name}" no tiene un precio por hora configurado`);
        }
        const amount = Number(court.pricePerHour) * hours;
        console.log('   Monto calculado:', amount);
        return amount;
    }
    async findAll() {
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
        return reservations.map(reservation => ({
            ...reservation,
            amount: Number(reservation.amount)
        }));
    }
    async findAllWithDeleted() {
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
            withDeleted: true,
        });
        return reservations;
    }
    async getTotalCount() {
        return await this.reservationsRepository.count();
    }
    async findByUser(userId) {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const reservations = await this.reservationsRepository.find({
            where: { user: { id: userId } },
            relations: ['court', 'players'],
            order: { startTime: 'DESC' },
        });
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
        return reservations.map(reservation => ({
            ...reservation,
            amount: Number(reservation.amount)
        }));
    }
    async findOne(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        const reservation = await this.reservationsRepository.findOne({
            where: { id },
            relations: ['court', 'user', 'players'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation with ID ${id} not found`);
        }
        reservation.amount = Number(reservation.amount);
        return reservation;
    }
    async updateStatus(id, status) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id },
            relations: ['court', 'user', 'players'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation with ID ${id} not found`);
        }
        const oldStatus = reservation.status;
        reservation.status = status;
        const updatedReservation = await this.reservationsRepository.save(reservation);
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            try {
                if (reservation.equipment && reservation.equipment.length > 0) {
                    console.log('🔄 Restaurando stock del equipamiento cancelado...');
                    for (const item of reservation.equipment) {
                        try {
                            await this.productsService.restoreStock(parseInt(item.id), item.quantity);
                            console.log(`✅ Stock restaurado para ${item.name}: +${item.quantity} unidades`);
                        }
                        catch (error) {
                            console.error(`❌ Error restaurando stock para ${item.name}:`, error);
                        }
                    }
                }
                console.log('Reserva cancelada - email de notificación pendiente');
            }
            catch (emailError) {
                console.error('Error enviando email de cancelación:', emailError);
            }
        }
        return updatedReservation;
    }
    async getAvailableTimeSlots(courtId, date) {
        const [year, month, day] = date.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day);
        const startOfDay = new Date(baseDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(baseDate);
        endOfDay.setHours(23, 59, 59, 999);
        const existingReservations = await this.reservationsRepository.find({
            where: {
                courtId,
                status: (0, typeorm_2.In)(['confirmed', 'pending']),
                startTime: (0, typeorm_2.Between)(startOfDay, endOfDay)
            },
            order: { startTime: 'ASC' }
        });
        const timeSlots = [];
        const scheduleSlots = [
            { hour: 8, minute: 0 },
            { hour: 9, minute: 30 },
            { hour: 11, minute: 0 },
            { hour: 12, minute: 30 },
            { hour: 14, minute: 0 },
            { hour: 15, minute: 30 },
        ];
        for (const slot of scheduleSlots) {
            const startTime = new Date(Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), slot.hour, slot.minute, 0, 0));
            const endTime = new Date(startTime.getTime() + 90 * 60 * 1000);
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
    async isCourtAvailable(courtId, startTime, endTime) {
        const conflictingReservations = await this.reservationsRepository.createQueryBuilder('reservation')
            .where('reservation.courtId = :courtId', { courtId })
            .andWhere('reservation.status IN (:...statuses)', { statuses: ['confirmed', 'pending'] })
            .andWhere('(reservation.startTime < :endTime AND reservation.endTime > :startTime)', { startTime, endTime })
            .getCount();
        return conflictingReservations === 0;
    }
    async getDetailedReservationStats() {
        try {
            console.log('🔍 Starting getDetailedReservationStats...');
            console.log('🏟️ Fetching courts...');
            const courts = await this.courtsRepository.find();
            console.log(`✅ Found ${courts.length} courts:`, courts.map(c => ({ id: c.id, name: c.name })));
            if (courts.length === 0) {
                console.log('⚠️ No courts found, returning empty stats');
                return [];
            }
            console.log('📊 Calculating stats for each court...');
            const stats = await Promise.all(courts.map(async (court) => {
                try {
                    console.log(`🔍 Processing court: ${court.name} (ID: ${court.id})`);
                    const reservations = await this.reservationsRepository
                        .createQueryBuilder('reservation')
                        .where('reservation.courtId = :courtId', { courtId: court.id })
                        .getMany();
                    console.log(`📋 Court ${court.name} has ${reservations.length} reservations`);
                    const activeCount = reservations.filter(r => ['confirmed', 'completed', 'pending'].includes(r.status)).length;
                    const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;
                    const completedCount = reservations.filter(r => r.status === 'completed').length;
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
                }
                catch (courtError) {
                    console.error(`❌ Error processing court ${court.name}:`, courtError);
                    return {
                        courtId: court.id,
                        court: court.name,
                        reservations: 0,
                        cancelled: 0,
                        completed: 0,
                        revenue: 0
                    };
                }
            }));
            console.log('🎉 Final stats calculated:', stats);
            return stats;
        }
        catch (error) {
            console.error('💥 Critical error in getDetailedReservationStats:', error);
            console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
            throw new Error(`Failed to get court stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(court_entity_1.Court)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(player_entity_1.Player)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        email_service_1.EmailService,
        products_service_1.ProductsService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map