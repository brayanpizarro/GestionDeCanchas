"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const rutValidator_1 = require("../utils/rutValidator");
let ReservationsService = class ReservationsService {
    reservationsRepository;
    courtsRepository;
    usersRepository;
    playersRepository;
    usersService;
    emailService;
    constructor(reservationsRepository, courtsRepository, usersRepository, playersRepository, usersService, emailService) {
        this.reservationsRepository = reservationsRepository;
        this.courtsRepository = courtsRepository;
        this.usersRepository = usersRepository;
        this.playersRepository = playersRepository;
        this.usersService = usersService;
        this.emailService = emailService;
    }
    async create(rawDto) {
        console.log('Raw DTO received:', rawDto);
        const dto = (0, class_transformer_1.plainToInstance)(create_reservation_dto_1.CreateReservationDto, rawDto, {
            excludeExtraneousValues: true,
        });
        console.log('Transformed DTO:', dto);
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
        const { courtId, userId, startTime, endTime, players } = dto;
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
        const reservation = this.reservationsRepository.create({
            startTime: startDate,
            endTime: endDate,
            status: 'pending',
            amount,
            court,
            user,
        });
        const savedReservation = await this.reservationsRepository.save(reservation);
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
        return court.pricePerHour * hours;
    }
    async findAll() {
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
        return reservations;
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
        return reservations;
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
                console.log('Reserva cancelada - email de notificación pendiente');
            }
            catch (emailError) {
                console.error('Error enviando email de cancelación:', emailError);
            }
        }
        return updatedReservation;
    }
    async getAvailableTimeSlots(courtId, date, duration = 90) {
        if (!Number.isInteger(courtId) || courtId <= 0) {
            throw new common_1.BadRequestException('Invalid court ID');
        }
        if (typeof date !== 'string' || !date) {
            throw new common_1.BadRequestException('Invalid date');
        }
        const court = await this.courtsRepository.findOneBy({ id: courtId });
        if (!court) {
            throw new common_1.NotFoundException(`Court with ID ${courtId} not found`);
        }
        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const reservations = await this.reservationsRepository.find({
            where: {
                court: { id: courtId },
                startTime: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: (0, typeorm_2.In)(['confirmed', 'pending']),
            },
            order: { startTime: 'ASC' },
        });
        const availableTimeSlots = [];
        const requestedDuration = duration;
        const slotInterval = 30;
        const openingTime = new Date(date);
        openingTime.setHours(8, 0, 0, 0);
        const closingTime = new Date(date);
        closingTime.setHours(18, 0, 0, 0);
        let currentSlot = new Date(openingTime);
        while (currentSlot < closingTime) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + requestedDuration);
            if (slotEnd > closingTime) {
                break;
            }
            const isAvailable = !reservations.some(reservation => {
                return (currentSlot < reservation.endTime && slotEnd > reservation.startTime);
            });
            if (isAvailable) {
                availableTimeSlots.push({
                    startTime: new Date(currentSlot),
                    endTime: new Date(slotEnd),
                });
            }
            currentSlot = new Date(currentSlot);
            currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
        }
        return availableTimeSlots;
    }
    async getTimeSlotsWithAvailability(courtId, date) {
        if (!Number.isInteger(courtId) || courtId <= 0) {
            throw new common_1.BadRequestException('Invalid court ID');
        }
        const court = await this.courtsRepository.findOneBy({ id: courtId });
        if (!court) {
            throw new common_1.NotFoundException(`Court with ID ${courtId} not found`);
        }
        const startOfDay = new Date(date);
        if (isNaN(startOfDay.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const reservations = await this.reservationsRepository.find({
            where: {
                court: { id: courtId },
                startTime: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: (0, typeorm_2.In)(['confirmed', 'pending']),
            },
            order: { startTime: 'ASC' },
        });
        const timeSlots = [];
        const slotDuration = 60;
        const openingTime = new Date(date);
        openingTime.setHours(8, 0, 0, 0);
        const closingTime = new Date(date);
        closingTime.setHours(18, 0, 0, 0);
        let currentSlot = new Date(openingTime);
        while (currentSlot < closingTime) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
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
                    status: conflictingReservation.status,
                    reservationId: conflictingReservation.id,
                });
            }
            else {
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
    async cancelReservation(reservationId, reason, isAdminCancellation = false) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId },
            relations: ['user', 'court', 'players']
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        if (reservation.status === 'cancelled') {
            throw new common_1.BadRequestException('Esta reserva ya está cancelada');
        }
        if (reservation.status === 'completed') {
            throw new common_1.BadRequestException('No se puede cancelar una reserva completada');
        }
        if (!isAdminCancellation) {
            const now = new Date();
            const reservationTime = new Date(reservation.startTime);
            const timeDiff = reservationTime.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 3600);
            if (hoursDiff < 2) {
                throw new common_1.BadRequestException('No se puede cancelar la reserva con menos de 2 horas de anticipación');
            }
        }
        try {
            reservation.status = 'cancelled';
            const cancelledReservation = await this.reservationsRepository.save(reservation);
            if (reservation.status === 'confirmed') {
                const amount = parseFloat(reservation.amount.toString());
                await this.usersService.addBalance(reservation.userId, amount);
                console.log(`💰 Saldo de ${amount} devuelto al usuario ${reservation.userId}`);
            }
            try {
                const { EmailService } = await Promise.resolve().then(() => __importStar(require('../email/email.service')));
                const emailService = new EmailService();
                await emailService.sendReservationCancellation(reservation.user.email, reservation.user.name, {
                    id: cancelledReservation.id,
                    courtName: reservation.court.name,
                    date: reservation.startTime.toISOString(),
                    startTime: reservation.startTime.toISOString(),
                    endTime: reservation.endTime.toISOString(),
                    cancellationReason: reason
                });
                console.log('✅ Email de cancelación enviado');
            }
            catch (emailError) {
                console.error('❌ Error enviando email de cancelación:', emailError);
            }
            return {
                success: true,
                message: isAdminCancellation
                    ? 'Reserva cancelada por administrador y usuario notificado'
                    : 'Reserva cancelada exitosamente y saldo reembolsado'
            };
        }
        catch (error) {
            console.error('Error en cancelación de reserva:', error);
            throw new common_1.BadRequestException('Error al cancelar la reserva');
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
        email_service_1.EmailService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map