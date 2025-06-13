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
const email_utils_1 = require("../utils/email.utils");
const users_service_1 = require("../users/users.service");
let ReservationsService = class ReservationsService {
    reservationsRepository;
    courtsRepository;
    usersRepository;
    playersRepository;
    usersService;
    constructor(reservationsRepository, courtsRepository, usersRepository, playersRepository, usersService) {
        this.reservationsRepository = reservationsRepository;
        this.courtsRepository = courtsRepository;
        this.usersRepository = usersRepository;
        this.playersRepository = playersRepository;
        this.usersService = usersService;
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
        const existingReservation = await this.reservationsRepository.findOne({
            where: {
                court: { id: courtId },
                startTime: (0, typeorm_2.Between)(startDate, endDate),
                status: 'confirmed',
            },
            relations: ['court'],
        });
        if (existingReservation) {
            throw new common_1.BadRequestException('This court is already reserved for the specified time');
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
        const playerEntities = players.map(playerDto => {
            return this.playersRepository.create({
                ...playerDto,
                reservation: savedReservation,
            });
        });
        savedReservation.players = await this.playersRepository.save(playerEntities);
        const finalReservation = await this.reservationsRepository.save(savedReservation);
        console.log('🎯 Reserva creada con estado pendiente. Email se enviará tras confirmación de pago.');
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
                await (0, email_utils_1.sendReservationConfirmation)(reservation.user.email, reservation.user.name, {
                    id: confirmedReservation.id,
                    courtName: reservation.court.name,
                    date: reservation.startTime.toISOString(),
                    startTime: reservation.startTime.toISOString(),
                    endTime: reservation.endTime.toISOString(),
                    duration: Math.round(duration),
                    players: reservation.players.map(p => `${p.firstName} ${p.lastName}`)
                });
                console.log('✅ Email de confirmación enviado tras pago exitoso');
            }
            catch (emailError) {
                console.error('❌ Error enviando email de confirmación:', emailError);
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
        console.log('🔍 Ejecutando findAll() en ReservationsService...');
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
        console.log(`📊 findAll() encontró ${reservations.length} reservas`);
        return reservations;
    }
    async findAllWithDeleted() {
        console.log('🔍 Ejecutando findAllWithDeleted() - incluyendo eliminadas...');
        const reservations = await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
            withDeleted: true,
        });
        console.log(`📊 findAllWithDeleted() encontró ${reservations.length} reservas (incluyendo eliminadas)`);
        return reservations;
    }
    async getTotalCount() {
        return await this.reservationsRepository.count();
    }
    async findByUser(userId) {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        return await this.reservationsRepository.find({
            where: { user: { id: userId } },
            relations: ['court', 'players'],
            order: { startTime: 'DESC' },
        });
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
    async getAvailableTimeSlots(courtId, date) {
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
        const slotDuration = 60;
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
        closingTime.setHours(22, 0, 0, 0);
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
        users_service_1.UsersService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map