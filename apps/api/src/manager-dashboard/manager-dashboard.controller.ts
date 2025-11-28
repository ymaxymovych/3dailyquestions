import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ManagerDashboardService } from './manager-dashboard.service';

import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('manager-dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ManagerDashboardController {
    constructor(private readonly dashboardService: ManagerDashboardService) { }

    @Get('team-reports')
    async getTeamReports(
        @Request() req: any,
        @Query('date') date?: string,
        @Query('status') status?: 'submitted' | 'not_submitted' | 'all',
        @Query('hasHelpRequest') hasHelpRequest?: string,
        @Query('hasBigTask') hasBigTask?: string,
    ) {
        const managerId = req.user.userId;
        const organizationId = req.organizationId;
        const reportDate = date || new Date().toISOString().split('T')[0];

        const filters = {
            status: status || 'all',
            hasHelpRequest: hasHelpRequest === 'true' ? true : hasHelpRequest === 'false' ? false : undefined,
            hasBigTask: hasBigTask === 'true' ? true : hasBigTask === 'false' ? false : undefined,
        };

        return this.dashboardService.getTeamReports(managerId, organizationId, reportDate, filters);
    }

    @Get('summary')
    async getTeamSummary(
        @Request() req: any,
        @Query('date') date?: string,
    ) {
        const managerId = req.user.userId;
        const organizationId = req.organizationId;
        const reportDate = date || new Date().toISOString().split('T')[0];

        return this.dashboardService.getTeamSummary(managerId, organizationId, reportDate);
    }

    @Get('employee/:userId/history')
    async getEmployeeHistory(
        @Request() req: any,
        @Param('userId') userId: string,
        @Query('days') days?: string,
    ) {
        const managerId = req.user.userId;
        const daysCount = days ? parseInt(days, 10) : 7;

        return this.dashboardService.getEmployeeHistory(managerId, userId, daysCount);
    }
}
