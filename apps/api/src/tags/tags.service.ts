import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateTagDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.tag.create({
            data: {
                name: dto.name,
                color: dto.color || '#808080',
                orgId: user.orgId,
            },
        });
    }

    async findAll(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.tag.findMany({
            where: { orgId: user.orgId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(userId: string, id: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const tag = await this.prisma.tag.findUnique({
            where: { id },
        });

        if (!tag || tag.orgId !== user.orgId) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async update(userId: string, id: string, dto: CreateTagDto) {
        await this.findOne(userId, id); // Ensure existence and ownership check

        return this.prisma.tag.update({
            where: { id },
            data: {
                name: dto.name,
                color: dto.color,
            },
        });
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id); // Ensure existence and ownership check

        return this.prisma.tag.delete({
            where: { id },
        });
    }
}
