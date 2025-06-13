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
const email_utils_1 = require("../utils/email.utils");
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
    async getDebugReservations() {
        const allReservations = await this.reservationsService.findAllWithDeleted();
        console.log('🔍 DEBUG - Total reservas (incluyendo eliminadas):', allReservations.length);
        return {
            total: allReservations.length,
            reservations: allReservations
        };
    }
    async findAllReservations() {
        console.log('🔍 Admin solicitando TODAS las reservas...');
        const allReservations = await this.reservationsService.findAll();
        console.log(`📊 Total de reservas encontradas: ${allReservations.length}`);
        allReservations.forEach((reservation, index) => {
            console.log(`📋 Reserva ${index + 1}:`, {
                id: reservation.id,
                user: reservation.user?.name || 'Sin usuario',
                court: reservation.court?.name || 'Sin cancha',
                status: reservation.status,
                date: new Date(reservation.startTime).toLocaleDateString()
            });
        });
        return allReservations;
    }
    findByUser(userId) {
        return this.reservationsService.findByUser(userId);
    }
    getAvailableTimeSlots(courtId, date) {
        return this.reservationsService.getAvailableTimeSlots(courtId, date);
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
    async testEmail() {
        console.log('🧪 Endpoint de prueba de email llamado');
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return {
                success: false,
                message: 'Variables de entorno de email no configuradas',
                config: {
                    EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'NO CONFIGURADO',
                    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configurado' : 'NO CONFIGURADO'
                }
            };
        }
        try {
            const testReservationData = {
                id: 999,
                courtName: 'Cancha de Prueba',
                date: new Date().toISOString(),
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                duration: 60,
                players: ['Juan Pérez', 'María González']
            };
            await (0, email_utils_1.sendReservationConfirmation)(process.env.EMAIL_USER, 'Usuario de Prueba', testReservationData);
            return {
                success: true,
                message: 'Email de prueba enviado exitosamente',
                sentTo: process.env.EMAIL_USER
            };
        }
        catch (error) {
            console.error('❌ Error en prueba de email:', error);
            return {
                success: false,
                message: 'Error enviando email de prueba',
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }
    async getAvailability(courtId, date) {
        return this.reservationsService.getTimeSlotsWithAvailability(courtId, date);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
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
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getDebugReservations", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findAllReservations", null);
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
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getAvailableTimeSlots", null);
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
    (0, common_1.Get)('test-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "testEmail", null);
__decorate([
    (0, common_1.Get)('availability/:courtId'),
    __param(0, (0, common_1.Param)('courtId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getAvailability", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map