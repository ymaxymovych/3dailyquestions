import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

    async updateRole(id: string, data: { name?: string; description?: string; scopes?: string[] }) {
        // Check if role exists
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Prevent modification of system roles (except scopes for custom roles)
        if (role.isSystem && data.name) {
            throw new BadRequestException('Cannot modify system role name');
        }

        return this.prisma.role.update({
            where: { id },
            data,
        });
    }

    async deleteRole(id: string) {
        // Check if role exists
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Prevent deletion of system roles
        if (role.isSystem) {
            throw new BadRequestException('Cannot delete system roles');
        }

        // Check if role is assigned to any users
        const userCount = await this.prisma.userRole.count({
            where: { roleId: id }
        });

        if (userCount > 0) {
            throw new BadRequestException(`Cannot delete role: ${userCount} user(s) still have this role`);
        }

        return this.prisma.role.delete({ where: { id } });
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
