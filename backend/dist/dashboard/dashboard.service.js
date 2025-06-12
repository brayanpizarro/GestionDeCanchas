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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const courts_service_1 = require("../courts/courts.service");
let DashboardService = class DashboardService {
    usersService;
    courtsService;
    constructor(usersService, courtsService) {
        this.usersService = usersService;
        this.courtsService = courtsService;
    }
    async getDashboardStats() {
        const [weeklyStats, dailyIncome, courtUsage, recentReservations, topPlayers, activityMetrics] = await Promise.all([
            this.getWeeklyStats(),
            this.calculateDailyIncome(),
            this.getCourtUsage(),
            this.getRecentReservations(),
            this.getTopPlayers(),
            this.calculateActivityMetrics()
        ]);
        return {
            reservationsToday: activityMetrics.reservationsToday,
            dailyIncome,
            activePlayers: activityMetrics.activePlayers,
            occupancyRate: activityMetrics.occupancyRate,
            weeklyStats,
            courtUsage,
            recentReservations,
            topPlayers
        };
    }
    async calculateDailyIncome() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservations = await this.courtsService.getReservationsForDate(today);
        return reservations.reduce((sum, res) => sum + (Number(res.amount) || 0), 0);
    }
    async getWeeklyStats() {
        const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const stats = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const reservations = await this.courtsService.getReservationsForDate(date);
            stats.push({
                name: days[i],
                reservas: reservations.length,
                ingresos: reservations.reduce((sum, res) => sum + (Number(res.amount) || 0), 0)
            });
        }
        return stats;
    }
    async getCourtUsage() {
        const courts = await this.courtsService.findAll();
        return courts.map((court, index) => ({
            name: court.name,
            value: Math.floor(Math.random() * 100),
            color: `hsl(${index * 40}, 70%, 50%)`
        }));
    }
    async getRecentReservations() {
        const reservations = await this.courtsService.getRecentReservations();
        return reservations.map(res => ({
            id: res.id,
            court: res.court?.name || 'Cancha',
            player: res.user?.name || 'Usuario',
            time: new Date(res.startTime).toLocaleTimeString(),
            date: new Date(res.startTime).toLocaleDateString(),
            status: res.status,
            amount: `$${res.amount}`
        }));
    }
    async getTopPlayers() {
        const players = await this.usersService.getTopPlayers();
        return players.map((player, index) => ({
            id: player.id,
            name: player.name,
            reservas: player.reservas,
            gasto: player.gasto,
            nivel: player.nivel,
            avatar: player.avatar || `https://i.pravatar.cc/150?img=${index + 1}`
        }));
    }
    async calculateActivityMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayReservations = await this.courtsService.getReservationsForDate(today);
        const activePlayers = await this.usersService.countActive();
        const courts = await this.courtsService.findAll();
        const occupiedCourts = courts.filter(c => c.status === 'occupied').length;
        const occupancyRate = courts.length > 0 ? (occupiedCourts / courts.length) * 100 : 0;
        return {
            activePlayers,
            occupancyRate,
            reservationsToday: todayReservations.length
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        courts_service_1.CourtsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map