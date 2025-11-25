import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { KpiService } from './kpi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-admin/kpi')
@UseGuards(JwtAuthGuard)
export class KpiController {
    constructor(private readonly kpiService: KpiService) { }

    @Get('definitions')
    async getDefinitions(@Request() req: any) {
        // Assuming user has orgId in JWT or we fetch it. For now fetching from user record
        // This is a simplification.
        return []; // TODO: Implement org context
    }

    @Get('my')
    async getMyKpis(@Request() req: any) {
        return this.kpiService.getUserKpis(req.user.userId);
    }

    @Post('assign')
    async assignKpi(@Request() req: any, @Body() body: { definitionId: string; targetValue: number }) {
        return this.kpiService.assignKpi(req.user.userId, body.definitionId, body.targetValue);
    }
}
