import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfile, Artifact, WorkdaySettings, ArtifactType, ProfileLayer } from '@repo/database';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
        });

        const workday = await this.prisma.workdaySettings.findUnique({
            where: { userId },
        });

        const artifacts = await this.prisma.artifact.findMany({
            where: { userId, isCurrent: true },
        });

        return { profile, workday, artifacts };
    }

    async updateProfile(userId: string, data: Partial<UserProfile>) {
        return this.prisma.userProfile.upsert({
            where: { userId },
            update: data,
            create: { ...data, userId },
        });
    }

    async updateWorkday(userId: string, data: Partial<WorkdaySettings>) {
        return this.prisma.workdaySettings.upsert({
            where: { userId },
            update: data,
            create: { ...data, userId },
        });
    }

    async addArtifact(userId: string, data: {
        type: ArtifactType;
        layer: ProfileLayer;
        title: string;
        content?: string;
        metadata?: any;
    }) {
        // Versioning logic: Mark old current artifacts of same type/layer as not current
        await this.prisma.artifact.updateMany({
            where: { userId, type: data.type, layer: data.layer, isCurrent: true },
            data: { isCurrent: false },
        });

        // Get next version number
        const lastArtifact = await this.prisma.artifact.findFirst({
            where: { userId, type: data.type, layer: data.layer },
            orderBy: { version: 'desc' },
        });
        const version = (lastArtifact?.version || 0) + 1;

        return this.prisma.artifact.create({
            data: {
                userId,
                ...data,
                version,
                isCurrent: true,
            },
        });
    }
}
