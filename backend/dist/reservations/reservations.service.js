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
let ReservationsService = class ReservationsService {
    reservationsRepository;
    courtsRepository;
    usersRepository;
    playersRepository;
    constructor(reservationsRepository, courtsRepository, usersRepository, playersRepository) {
        this.reservationsRepository = reservationsRepository;
        this.courtsRepository = courtsRepository;
        this.usersRepository = usersRepository;
        this.playersRepository = playersRepository;
    }
    async create(rawDto) {
        const dto = (0, class_transformer_1.plainToInstance)(create_reservation_dto_1.CreateReservationDto, rawDto, {
            excludeExtraneousValues: true,
        });
        const validationErrors = await (0, class_validator_1.validate)(dto);
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException('Invalid reservation data');
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
        return await this.reservationsRepository.save(savedReservation);
    }
    calculateAmount(court, startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return court.pricePerHour * hours;
    }
    async findAll() {
        return await this.reservationsRepository.find({
            relations: ['court', 'user', 'players'],
        });
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
        if (!Number.isInteger(id) || id <= 0) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            throw new common_1.BadRequestException('Invalid status');
        }
        const reservation = await this.findOne(id);
        reservation.status = status;
        return await this.reservationsRepository.save(reservation);
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
                status: 'confirmed',
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(court_entity_1.Court)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(player_entity_1.Player)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map