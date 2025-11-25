import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateProjectDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.project.create({
            data: {
                name: dto.name,
                description: dto.description,
                status: dto.status,
                orgId: user.orgId,
                ownerId: userId,
            },
        });
    }

    async findAll(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.project.findMany({
            where: { orgId: user.orgId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(userId: string, id: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project || project.orgId !== user.orgId) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async update(userId: string, id: string, dto: CreateProjectDto) {
        await this.findOne(userId, id); // Ensure existence and ownership check

        return this.prisma.project.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                status: dto.status,
            },
        });
    }

    async remove(userId: string, id: string) {
        await this.findOne(userId, id); // Ensure existence and ownership check

        return this.prisma.project.delete({
            where: { id },
        });
    }
}
