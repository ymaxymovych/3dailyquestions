import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateOrganizationDto) {
        // Generate slug if not provided
        let slug = dto.slug;
        if (!slug) {
            slug = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            // Add random suffix to ensure uniqueness if needed, or handle collision
            const existing = await this.prisma.organization.findUnique({ where: { slug } });
            if (existing) {
                slug = `${slug}-${Math.random().toString(36).substring(7)}`;
            }
        } else {
            // Check if provided slug exists
            const existing = await this.prisma.organization.findUnique({ where: { slug } });
            if (existing) {
                throw new BadRequestException('Organization with this slug already exists');
            }
        }

        return this.prisma.organization.create({
            data: {
                ...dto,
                slug,
            },
        });
    }

    async findAll() {
        return this.prisma.organization.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        projects: true,
                    },
                },
            },
        });
    }

    async findById(id: string) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        projects: true,
                    },
                },
            },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        return org;
    }

    async update(id: string, dto: UpdateOrganizationDto) {
        // Check existence
        await this.findById(id);

        return this.prisma.organization.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        // Check existence
        await this.findById(id);

        return this.prisma.organization.delete({
            where: { id },
        });
    }

    async checkUserLimit(organizationId: string): Promise<boolean> {
        const org = await this.findById(organizationId);
        const userCount = await this.prisma.user.count({
            where: { orgId: organizationId },
        });

        return userCount < (org as any).maxUsers;
    }
}
