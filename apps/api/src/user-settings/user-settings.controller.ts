import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';


@Controller('user-settings')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
    constructor(private readonly settingsService: UserSettingsService) { }

    // --- Profile ---
    @Get('profile')
    getProfile(@Request() req: any) {
        return this.settingsService.getProfile(req.user.userId);
    }

    @Patch('profile')
    updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        return this.settingsService.updateProfile(req.user.userId, dto);
    }

    // --- Preferences ---
    @Get('preferences')
    getPreferences(@Request() req: any) {
        return this.settingsService.getPreferences(req.user.userId);
    }

    @Patch('preferences')
    updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
        return this.settingsService.updatePreferences(req.user.userId, dto);
    }

    // --- Integrations ---
    @Get('integrations')
    getIntegrations(@Request() req: any) {
        return this.settingsService.getIntegrations(req.user.userId);
    }

    @Post('integrations')
    updateIntegration(@Request() req: any, @Body() dto: UpdateIntegrationDto) {
        return this.settingsService.updateIntegration(req.user.userId, dto);
    }

    // --- KPIs ---
    // Legacy KPI endpoints removed. Use KpiController from user-admin module.
}
