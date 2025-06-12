import { UsersService } from '../users/users.service';
import { CourtsService } from '../courts/courts.service';
import { DashboardStats } from './types/dashboard.types';
export declare class DashboardService {
    private readonly usersService;
    private readonly courtsService;
    constructor(usersService: UsersService, courtsService: CourtsService);
    getDashboardStats(): Promise<DashboardStats>;
    private calculateDailyIncome;
    private getWeeklyStats;
    private getCourtUsage;
    private getRecentReservations;
    private getTopPlayers;
    private calculateActivityMetrics;
}
