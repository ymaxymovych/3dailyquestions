import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AccessLogService } from './access-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('user-admin/access')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccessLogController {
    constructor(private readonly accessLogService: AccessLogService) { }

    @Post('request-detail')
    @RequirePermissions('team.read.detail.request') // Example scope
    async requestDetail(@Request() req: any, @Body() body: { targetId: string; reason: string; durationMinutes: number }) {
        // In a real flow, this might trigger a notification to the user for approval.
        // For now, we log it and auto-approve (as per "Manager" role spec in pilot).
        return this.accessLogService.logRequest({
            requesterId: req.user.userId,
            targetId: body.targetId,
            reason: body.reason,
            scopes: ['detail.read'],
            durationMinutes: body.durationMinutes || 60,
        });
    }

    @Get('logs')
    async getMyLogs(@Request() req: any) {
        return this.accessLogService.getLogs(req.user.userId);
    }
}
