import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserRole } from '@repo/database';

@Injectable()
export class RoleService {
    constructor(private prisma: PrismaService) { }

    async getAllRoles() {
        return this.prisma.role.findMany();
    }

    async createRole(data: { name: string; description?: string; scopes: string[]; isSystem?: boolean }) {
        return this.prisma.role.create({ data });
    }

    async updateRole(id: string, data: { description?: string; scopes?: string[] }) {
        return this.prisma.role.update({
            where: { id },
            data,
        });
    }

    async assignRole(userId: string, roleId: string, assignedBy: string) {
        // Check if assignment exists
        const existing = await this.prisma.userRole.findUnique({
            where: { userId_roleId: { userId, roleId } },
        });
        if (existing) return existing;

        return this.prisma.userRole.create({
            data: { userId, roleId, assignedBy },
        });
    }

    async revokeRole(userId: string, roleId: string) {
        return this.prisma.userRole.delete({
            where: { userId_roleId: { userId, roleId } },
        });
    }

    async getUserRoles(userId: string) {
        return this.prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
    }
}
