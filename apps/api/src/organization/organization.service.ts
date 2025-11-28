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

        // Extract domain from user email if possible (not passed here currently, but could be inferred)
        // For now, just create.
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

    // --- Onboarding & Invites ---

    async findSuggestedOrgs(email: string) {
        const { getEmailDomain, isFreeEmailProvider, isDisposableEmail } = await import('../common/utils/email-validator.js');

        const domain = getEmailDomain(email);

        // Block disposable emails
        if (isDisposableEmail(email)) {
            throw new BadRequestException('Disposable emails are not allowed');
        }

        // Don't search for free email providers (gmail, yahoo, etc)
        if (isFreeEmailProvider(email)) {
            return [];
        }

        const orgs = await this.prisma.organization.findMany({
            where: {
                domains: {
                    has: domain
                }
            },
            include: {
                users: {
                    take: 1,
                    orderBy: { createdAt: 'asc' },
                    select: { email: true, fullName: true }
                },
                _count: {
                    select: { users: true }
                }
            }
        });

        return orgs.map(org => {
            const count = org._count.users;
            let sizeRange = '1';
            if (count > 10) sizeRange = '10+';
            else if (count > 1) sizeRange = '2-10';

            const owner = org.users[0];
            const maskedEmail = owner ? owner.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'unknown';

            return {
                id: org.id,
                name: org.name,
                slug: org.slug,
                sizeRange,
                owner: {
                    name: owner?.fullName || 'Unknown',
                    email: maskedEmail
                }
            };
        });
    }

    async createInvite(orgId: string, inviterId: string, email: string, role: string = 'EMPLOYEE') {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

        const invite = await this.prisma.invite.create({
            data: {
                orgId,
                inviterId,
                email,
                token,
                role,
                expiresAt,
                status: 'PENDING'
            }
        });

        // In a real app, send email here.
        // For MVP, return the link.
        return {
            invite,
            link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join?token=${token}`
        };
    }

    async validateInvite(token: string) {
        const invite = await this.prisma.invite.findUnique({
            where: { token },
            include: { org: true, inviter: true }
        });

        if (!invite) {
            throw new NotFoundException('Invite not found');
        }

        if (invite.expiresAt < new Date()) {
            await this.prisma.invite.update({
                where: { id: invite.id },
                data: { status: 'EXPIRED' }
            });
            throw new BadRequestException('Invite expired');
        }

        if (invite.status !== 'PENDING') {
            throw new BadRequestException(`Invite is ${invite.status}`);
        }

        return {
            id: invite.org.id,
            name: invite.org.name,
            slug: invite.org.slug,
            inviter: invite.inviter.fullName,
            email: invite.email
        };
    }

    async acceptInvite(userId: string, token: string) {
        const invite = await this.prisma.invite.findUnique({ where: { token } });
        if (!invite || invite.status !== 'PENDING') throw new BadRequestException('Invalid invite');

        // Update user
        await this.prisma.user.update({
            where: { id: userId },
            data: { orgId: invite.orgId }
        });

        // Update invite
        await this.prisma.invite.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED' }
        });

        return { success: true, orgId: invite.orgId };
    }
}
