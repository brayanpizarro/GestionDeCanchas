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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
const create_reservation_dto_1 = require("./dto/create-reservation.dto");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async create(createReservationDto) {
        try {
            if (!createReservationDto.userId) {
                createReservationDto.userId = 1;
            }
            console.log('Received reservation data:', JSON.stringify(createReservationDto, null, 2));
            return await this.reservationsService.create(createReservationDto);
        }
        catch (error) {
            console.error('Error creating reservation:', error);
            throw new common_1.BadRequestException('Invalid reservation data');
        }
    }
    findAll() {
        return this.reservationsService.findAll();
    }
    async findAllReservations() {
        console.log('Admin solicitando TODAS las reservas...');
        const allReservations = await this.reservationsService.findAll();
        console.log(`Total de reservas encontradas: ${allReservations.length}`);
        return allReservations;
    }
    async getStats() {
        const [reservations, totalReservations] = await Promise.all([
            this.reservationsService.findAll(),
            this.reservationsService.getTotalCount()
        ]);
        const statusCounts = reservations.reduce((acc, reservation) => {
            acc[reservation.status] = (acc[reservation.status] || 0) + 1;
            return acc;
        }, {});
        const courtStats = reservations.reduce((acc, reservation) => {
            const courtName = reservation.court?.name || 'Cancha desconocida';
            if (!acc[courtName]) {
                acc[courtName] = { courtId: reservation.court?.id, court: courtName, reservations: 0 };
            }
            acc[courtName].reservations++;
            return acc;
        }, {});
        return {
            total: totalReservations,
            pending: statusCounts['pending'] || 0,
            confirmed: statusCounts['confirmed'] || 0,
            completed: statusCounts['completed'] || 0,
            cancelled: statusCounts['cancelled'] || 0,
            todayReservations: reservations.filter(r => new Date(r.startTime).toDateString() === new Date().toDateString()).length,
            courtStats: Object.values(courtStats)
        };
    }
    findByUser(userId) {
        return this.reservationsService.findByUser(userId);
    }
    async getAvailableTimeSlots(courtId, date) {
        if (!date) {
            throw new common_1.BadRequestException('Date parameter is required');
        }
        return await this.reservationsService.getAvailableTimeSlots(courtId, date);
    }
    async checkCourtAvailability(courtId, startTime, endTime) {
        if (!startTime || !endTime) {
            throw new common_1.BadRequestException('startTime and endTime parameters are required');
        }
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        const isAvailable = await this.reservationsService.isCourtAvailable(courtId, startDate, endDate);
        return {
            courtId,
            startTime,
            endTime,
            available: isAvailable
        };
    }
    async processPayment(reservationId, userId) {
        const finalUserId = userId || 1;
        return this.reservationsService.processPayment(reservationId, finalUserId);
    }
    findOne(id) {
        return this.reservationsService.findOne(id);
    }
    updateStatus(id, status) {
        return this.reservationsService.updateStatus(id, status);
    }
    async cancelReservation(id) {
        try {
            const result = await this.reservationsService.cancelReservation(+id);
            return {
                message: 'Reservation cancelled successfully',
                reservation: result
            };
        }
        catch (error) {
            console.error('Error cancelling reservation:', error);
            throw error;
        }
    }
    async getCourtStats() {
        try {
            console.log('Court stats endpoint called');
            const stats = await this.reservationsService.getDetailedReservationStats();
            console.log(' Returning stats:', stats);
            return stats;
        }
        catch (error) {
            console.error('Error in court-stats endpoint:', error);
            throw new common_1.BadRequestException(`Failed to get court statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservation_dto_1.CreateReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findAllReservations", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('available/:courtId'),
    __param(0, (0, common_1.Param)('courtId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getAvailableTimeSlots", null);
__decorate([
    (0, common_1.Get)('courts/:courtId/check-availability'),
    __param(0, (0, common_1.Param)('courtId')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "checkCourtAvailability", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "cancelReservation", null);
__decorate([
    (0, common_1.Get)('court-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getCourtStats", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map