import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessLogService {
    constructor(private prisma: PrismaService) { }

    async logRequest(data: {
        requesterId: string;
        targetId: string;
        reason: string;
        scopes: string[];
        durationMinutes: number;
    }) {
        const expiresAt = new Date(Date.now() + data.durationMinutes * 60000);

        return this.prisma.accessLog.create({
            data: {
                requesterId: data.requesterId,
                targetId: data.targetId,
                reason: data.reason,
                scopes: data.scopes,
                expiresAt,
            },
        });
    }

    async getLogs(userId: string) {
        return this.prisma.accessLog.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { targetId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
