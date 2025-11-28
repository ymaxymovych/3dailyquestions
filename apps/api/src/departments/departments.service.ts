import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateDepartmentDto {
    name: string;
    archetypeId?: string;
    managerId?: string;
    hrId?: string;
}

export class UpdateDepartmentDto {
    name?: string;
    managerId?: string;
    hrId?: string;
}

export class AssignUserDto {
    userId: string;
    roleArchetypeId?: string;
}

@Injectable()
export class DepartmentsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all department archetypes (templates)
     */
    async getArchetypes() {
        return this.prisma.departmentArchetype.findMany({
            include: {
                roles: true
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Get all departments for an organization
     */
    async findAll(orgId: string) {
        return this.prisma.department.findMany({
            where: { orgId },
            include: {
                archetype: {
                    include: {
                        roles: true
                    }
                },
                _count: {
                    select: { users: true, projects: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Get a single department by ID
     */
    async findOne(id: string, orgId: string) {
        const department = await this.prisma.department.findFirst({
            where: { id, orgId },
            include: {
                archetype: {
                    include: {
                        roles: true // Include available roles for this department type
                    }
                },
                users: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        roleArchetype: true, // Include user's role
                    }
                },
                projects: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    }
                },
                _count: {
                    select: { users: true, projects: true }
                }
            }
        });

        if (!department) {
            throw new NotFoundException('Department not found');
        }

        return department;
    }

    /**
     * Create a new department
     */
    async create(orgId: string, dto: CreateDepartmentDto) {
        // Verify manager and HR belong to the same org if provided
        if (dto.managerId) {
            const manager = await this.prisma.user.findFirst({
                where: { id: dto.managerId, orgId }
            });
            if (!manager) {
                throw new ForbiddenException('Manager not found in organization');
            }
        }

        if (dto.hrId) {
            const hr = await this.prisma.user.findFirst({
                where: { id: dto.hrId, orgId }
            });
            if (!hr) {
                throw new ForbiddenException('HR not found in organization');
            }
        }

        // Verify archetype exists if provided
        if (dto.archetypeId) {
            const archetype = await this.prisma.departmentArchetype.findUnique({
                where: { id: dto.archetypeId }
            });
            if (!archetype) {
                throw new NotFoundException('Department archetype not found');
            }
        }

        return this.prisma.department.create({
            data: {
                name: dto.name,
                orgId,
                archetypeId: dto.archetypeId,
                managerId: dto.managerId,
                hrId: dto.hrId,
            },
            include: {
                archetype: true,
                _count: {
                    select: { users: true, projects: true }
                }
            }
        });
    }

    /**
     * Update a department
     */
    async update(id: string, orgId: string, dto: UpdateDepartmentDto) {
        // Verify department exists and belongs to org
        const department = await this.prisma.department.findFirst({
            where: { id, orgId }
        });

        if (!department) {
            throw new NotFoundException('Department not found');
        }

        // Verify manager and HR belong to the same org if provided
        if (dto.managerId) {
            const manager = await this.prisma.user.findFirst({
                where: { id: dto.managerId, orgId }
            });
            if (!manager) {
                throw new ForbiddenException('Manager not found in organization');
            }
        }

        if (dto.hrId) {
            const hr = await this.prisma.user.findFirst({
                where: { id: dto.hrId, orgId }
            });
            if (!hr) {
                throw new ForbiddenException('HR not found in organization');
            }
        }

        return this.prisma.department.update({
            where: { id },
            data: dto,
            include: {
                archetype: true,
                _count: {
                    select: { users: true, projects: true }
                }
            }
        });
    }

    /**
     * Delete a department
     */
    async remove(id: string, orgId: string) {
        // Verify department exists and belongs to org
        const department = await this.prisma.department.findFirst({
            where: { id, orgId },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        if (!department) {
            throw new NotFoundException('Department not found');
        }

        // Prevent deletion if department has users
        if (department._count.users > 0) {
            throw new ForbiddenException('Cannot delete department with assigned users');
        }

        await this.prisma.department.delete({
            where: { id }
        });

        return { message: 'Department deleted successfully' };
    }

    /**
     * Assign user to department with optional role archetype
     */
    async assignUser(departmentId: string, orgId: string, dto: AssignUserDto) {
        // Verify department exists and belongs to org
        const department = await this.prisma.department.findFirst({
            where: { id: departmentId, orgId }
        });

        if (!department) {
            throw new NotFoundException('Department not found');
        }

        // Verify user exists and belongs to org
        const user = await this.prisma.user.findFirst({
            where: { id: dto.userId, orgId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify role archetype exists if provided
        if (dto.roleArchetypeId) {
            const role = await this.prisma.roleArchetype.findUnique({
                where: { id: dto.roleArchetypeId }
            });
            if (!role) {
                throw new NotFoundException('Role archetype not found');
            }
        }

        // Update user's department and role
        return this.prisma.user.update({
            where: { id: dto.userId },
            data: {
                deptId: departmentId,
                roleArchetypeId: dto.roleArchetypeId
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                deptId: true,
                roleArchetype: true,
            }
        });
    }

    /**
     * Get all available users in the organization for assignment
     */
    async getAvailableUsers(orgId: string) {
        return this.prisma.user.findMany({
            where: { orgId },
            select: {
                id: true,
                email: true,
                fullName: true,
                deptId: true,
                roleArchetype: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            },
            orderBy: { fullName: 'asc' }
        });
    }

    /**
     * Remove user from department
     */
    async removeUser(departmentId: string, orgId: string, userId: string) {
        // Verify department belongs to org
        const dept = await this.prisma.department.findFirst({
            where: { id: departmentId, orgId }
        });

        if (!dept) {
            throw new NotFoundException('Department not found');
        }

        // Verify user belongs to this department
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deptId: departmentId, orgId }
        });

        if (!user) {
            throw new NotFoundException('User not found in this department');
        }

        // Remove user from department
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                deptId: null
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                deptId: true
            }
        });
    }
}
