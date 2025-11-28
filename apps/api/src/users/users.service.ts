import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService
    ) { }

    async findOne(id: string, organizationId?: string) {
        return this.prisma.user.findFirst({
            where: {
                id,
                ...(organizationId && { orgId: organizationId })
            },
            include: {
                org: true,
                department: true,
            },
        });
    }

    async getProfile(userId: string) {
        const user = await this.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        // Remove sensitive data
        const { passwordHash, ...result } = user;
        return result;
    }

    /**
     * Get all pending users for an organization
     */
    async getPendingUsers(orgId: string) {
        return this.prisma.user.findMany({
            where: {
                orgId,
                status: 'PENDING'
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Approve a pending user
     */
    async approveUser(userId: string, adminOrgId: string) {
        // Verify user belongs to the same org and is pending
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                orgId: adminOrgId,
                status: 'PENDING'
            },
            include: {
                org: true
            }
        });

        if (!user) {
            throw new NotFoundException('Pending user not found');
        }

        // Update status to ACTIVE
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' }
        });

        // Send approval email
        await this.emailService.sendRequestApprovedEmail(user.email, user.org.name);

        return { message: 'User approved successfully', user: updatedUser };
    }

    /**
     * Reject a pending user (deletes the user)
     */
    async rejectUser(userId: string, adminOrgId: string) {
        // Verify user belongs to the same org and is pending
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                orgId: adminOrgId,
                status: 'PENDING'
            },
            include: {
                org: true
            }
        });

        if (!user) {
            throw new NotFoundException('Pending user not found');
        }

        // Send rejection email before deleting
        await this.emailService.sendRequestRejectedEmail(user.email, user.org.name);

        // Delete user
        await this.prisma.user.delete({
            where: { id: userId }
        });

        return { message: 'User rejected and removed' };
    }
}
