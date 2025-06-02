import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CourtsService } from '../courts/courts.service';
import { DashboardStats, WeeklyStats } from './types/dashboard.types';

@Injectable()
export class DashboardService {
    constructor(
        private readonly usersService: UsersService,
        private readonly productsService: ProductsService,
        private readonly courtsService: CourtsService,
    ) {}

    async getDashboardStats(): Promise<DashboardStats> {
        const [
            userStats, 
            productStats, 
            courtStats, 
            weeklyStats,
            dailyIncome,
            courtUsage,
            recentReservations,
            topPlayers,
            activityMetrics
        ] = await Promise.all([
            this.usersService.getStats(),
            this.productsService.getStats(),
            this.courtsService.getStats(),
            this.getWeeklyStats(),
            this.calculateDailyIncome(),
            this.courtsService.getCourtUsage(),
            this.courtsService.getRecentBookings(),
            this.usersService.getTopPlayers(),
            this.calculateActivityMetrics()
        ]);

        return {
            users: userStats,
            products: {
                total: productStats.total || 0,
                available: (productStats.total - (productStats.lowStock || 0)) || 0, // Calculate available from total - lowStock
                totalStock: productStats.totalStock || 0,
                lowStock: productStats.lowStock || 0,
                categories: productStats.categories || []
            },
            courts: {
                total: courtStats.total || 0,
                available: courtStats.available || 0,
                occupied: courtStats.occupied || 0,
                maintenance: courtStats.underMaintenance || 0, // Use underMaintenance for maintenance
                totalReservations: courtStats.totalReservations || 0
            },
            weeklyStats,
            courtUsage,
            recentReservations,
            topPlayers,
            summary: {
                totalUsers: userStats.total,
                activeUsers: userStats.active,
                totalProducts: productStats.total,
                totalStock: productStats.totalStock,
                totalCourts: courtStats.total,
                availableCourts: courtStats.available,
                totalReservations: courtStats.totalReservations,
                dailyIncome
            },
            activePlayers: activityMetrics.activePlayers,
            reservationsToday: activityMetrics.reservationsToday,
            dailyIncome,
            occupancyRate: activityMetrics.occupancyRate
        };
    }

    private async calculateDailyIncome(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservations = await this.courtsService.getReservationsForDate(today);
        return reservations.reduce((sum, res) => sum + res.amount, 0);
    }

    private async getWeeklyStats(): Promise<WeeklyStats[]> {
        const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);

        const stats: WeeklyStats[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const reservations = await this.courtsService.getReservationsForDate(date);
            
            stats.push({
                name: days[i],
                reservas: reservations.length,
                ingresos: reservations.reduce((sum, res) => sum + res.amount, 0)
            });
        }

        return stats;
    }

    private async calculateActivityMetrics(): Promise<{ activePlayers: number; occupancyRate: number; reservationsToday: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get today's reservations and active players
        const todayReservations = await this.courtsService.getReservationsForDate(today);
        const activePlayers = await this.usersService.getActivePlayerCount();

        // Calculate occupancy rate
        const { total, occupied } = await this.courtsService.getStats();
        const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

        return {
            activePlayers,
            occupancyRate,
            reservationsToday: todayReservations.length
        };
    }
}