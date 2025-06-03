import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CourtsService } from '../courts/courts.service';
import { DashboardStats, WeeklyStats, CourtUsage, RecentReservation, TopPlayer } from './types/dashboard.types';


@Injectable()
export class DashboardService {
    constructor(
        private readonly usersService: UsersService,
        private readonly courtsService: CourtsService,
    ) {}

    async getDashboardStats(): Promise<DashboardStats> {
        const [
            weeklyStats,
            dailyIncome,
            courtUsage,
            recentReservations,
            topPlayers,
            activityMetrics
        ] = await Promise.all([
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
    }    private async calculateDailyIncome(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservations = await this.courtsService.getReservationsForDate(today);
        return reservations.reduce((sum, res) => sum + (Number(res.amount) || 0), 0);
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
                ingresos: reservations.reduce((sum, res) => sum + (Number(res.amount) || 0), 0)
            });
        }
        return stats;
    }

    private async getCourtUsage(): Promise<CourtUsage[]> {
        const courts = await this.courtsService.findAll();
        return courts.map((court, index) => ({
            name: court.name,
            value: Math.floor(Math.random() * 100), // Esto debería ser reemplazado con datos reales
            color: `hsl(${index * 40}, 70%, 50%)`
        }));
    }

    private async getRecentReservations(): Promise<RecentReservation[]> {
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
    }    private async getTopPlayers(): Promise<TopPlayer[]> {
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

    private async calculateActivityMetrics(): Promise<{ activePlayers: number; occupancyRate: number; reservationsToday: number }> {
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
}

