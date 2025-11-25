import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class UserSettingsService {
    constructor(private prisma: PrismaService) { }

    // --- Profile ---
    async getProfile(userId: string) {
        const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
        if (!profile) {
            // Create default if not exists
            return this.prisma.userProfile.create({ data: { userId } });
        }
        return profile;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        return this.prisma.userProfile.upsert({
            where: { userId },
            create: { userId, ...dto },
            update: dto,
        });
    }

    // --- Preferences ---
    async getPreferences(userId: string) {
        const prefs = await this.prisma.userPreferences.findUnique({ where: { userId } });
        if (!prefs) {
            return this.prisma.userPreferences.create({ data: { userId } });
        }
        return prefs;
    }

    async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
        return this.prisma.userPreferences.upsert({
            where: { userId },
            create: { userId, ...dto },
            update: dto,
        });
    }

    // --- Integrations ---
    async getIntegrations(userId: string) {
        return this.prisma.integration.findMany({ where: { userId } });
    }

    async updateIntegration(userId: string, dto: UpdateIntegrationDto) {
        return this.prisma.integration.upsert({
            where: {
                userId_type: {
                    userId,
                    type: dto.type,
                },
            },
            create: {
                userId,
                type: dto.type,
                credentials: dto.credentials ?? {},
                settings: dto.settings ?? {},
                isEnabled: dto.isEnabled ?? false,
            },
            update: {
                credentials: dto.credentials,
                settings: dto.settings,
                isEnabled: dto.isEnabled,
            },
        });
    }

    // --- KPIs ---
    // Legacy KPI methods removed. Use KpiService from user-admin module.
}
