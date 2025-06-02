import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { DashboardStats } from './types/dashboard.types';

@Controller('api/v1/dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    async getDashboardStats(): Promise<DashboardStats> {
        return await this.dashboardService.getDashboardStats();
    }

    @Get('courts')
    async getCourtsUsage() {
        const stats = await this.dashboardService.getDashboardStats();
        return { courts: stats.courtUsage };
    }

    @Get('recent-activity')
    async getRecentActivity() {
        const stats = await this.dashboardService.getDashboardStats();
        return {
            reservations: stats.recentReservations,
            topPlayers: stats.topPlayers
        };
    }
}