import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';


@Controller('dashboard')
@UseGuards(AuthGuard, RoleGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    async getDashboardStats() {
        return this.dashboardService.getDashboardStats();
    }
}

