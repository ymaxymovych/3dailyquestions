import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ThreeBlocks, ThreeBlocksStatus } from '@repo/database';

@Injectable()
export class ThreeBlocksService {
    constructor(private prisma: PrismaService) { }

    async getThreeBlocks(userId: string, date: Date): Promise<ThreeBlocks> {
        // Ensure date is at midnight UTC to match database storage
        const normalizedDate = new Date(date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        let blocks = await this.prisma.threeBlocks.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: normalizedDate,
                },
            },
        });

        if (!blocks) {
            blocks = await this.prisma.threeBlocks.create({
                data: {
                    userId,
                    date: normalizedDate,
                    status: ThreeBlocksStatus.DRAFT,
                },
            });
        }

        return blocks;
    }

    async updateThreeBlocks(
        userId: string,
        date: Date,
        data: {
            yesterdayTasks?: string;
            yesterdayMetrics?: string;
            todayPlan?: string;
            helpNeeded?: string;
        },
    ): Promise<ThreeBlocks> {
        const normalizedDate = new Date(date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        return this.prisma.threeBlocks.upsert({
            where: {
                userId_date: {
                    userId,
                    date: normalizedDate,
                },
            },
            update: {
                ...data,
                updatedAt: new Date(),
            },
            create: {
                userId,
                date: normalizedDate,
                ...data,
                status: ThreeBlocksStatus.DRAFT,
            },
        });
    }

    async publishThreeBlocks(userId: string, date: Date): Promise<ThreeBlocks> {
        const normalizedDate = new Date(date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        const blocks = await this.prisma.threeBlocks.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: normalizedDate,
                },
            },
        });

        if (!blocks) {
            throw new NotFoundException('Three blocks not found for this date');
        }

        // TODO: Send notification to manager if helpNeeded is not empty

        return this.prisma.threeBlocks.update({
            where: {
                id: blocks.id,
            },
            data: {
                status: ThreeBlocksStatus.PUBLISHED,
                updatedAt: new Date(),
            },
        });
    }
}
