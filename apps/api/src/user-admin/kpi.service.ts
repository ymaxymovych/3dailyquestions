import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KpiDefinition, UserKPI, KpiPeriod, KpiSource } from '@repo/database';

@Injectable()
export class KpiService {
    constructor(private prisma: PrismaService) { }

    async getKpiDefinitions(orgId: string) {
        return this.prisma.kpiDefinition.findMany({
            where: { orgId },
        });
    }

    async createKpiDefinition(data: {
        name: string;
        unit: string;
        period: KpiPeriod;
        source: KpiSource;
        orgId: string
    }) {
        return this.prisma.kpiDefinition.create({ data });
    }

    async getUserKpis(userId: string) {
        return this.prisma.userKPI.findMany({
            where: { userId },
            include: { definition: true },
        });
    }

    async assignKpi(userId: string, definitionId: string, targetValue: number) {
        return this.prisma.userKPI.create({
            data: { userId, definitionId, targetValue },
        });
    }
}
