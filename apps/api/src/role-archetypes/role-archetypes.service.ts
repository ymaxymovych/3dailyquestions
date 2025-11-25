import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleArchetypesService {
    constructor(private prisma: PrismaService) { }

    async getAllDepartments() {
        return this.prisma.departmentArchetype.findMany({
            include: {
                roles: {
                    include: {
                        kpis: true,
                    },
                },
            },
            orderBy: {
                code: 'asc',
            },
        });
    }

    async getDepartmentByCode(code: string) {
        return this.prisma.departmentArchetype.findUnique({
            where: { code },
            include: {
                roles: {
                    include: {
                        kpis: true,
                    },
                },
            },
        });
    }

    async getRoleByCode(code: string) {
        return this.prisma.roleArchetype.findUnique({
            where: { code },
            include: {
                departmentArchetype: true,
                kpis: true,
            },
        });
    }

    async getRoleKPIs(code: string) {
        const role = await this.prisma.roleArchetype.findUnique({
            where: { code },
            include: {
                kpis: true,
            },
        });

        return role?.kpis || [];
    }
}
