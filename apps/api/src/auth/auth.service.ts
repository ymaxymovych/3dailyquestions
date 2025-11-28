import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Validate disposable emails
        const { isDisposableEmail } = await import('../common/utils/email-validator.js');
        if (isDisposableEmail(dto.email)) {
            throw new BadRequestException('Disposable emails are not allowed. Please use a permanent email address.');
        }

        // 1. Check if user exists
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('User already exists');

        // 2. Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        // 3. Create Org & User (Transaction)
        const user = await this.prisma.$transaction(async (tx) => {
            let orgId: string;
            let roleName = 'EMPLOYEE'; // Default role for joiners

            if (dto.orgName) {
                // Create new organization
                const org = await tx.organization.create({
                    data: { name: dto.orgName },
                });
                orgId = org.id;
                roleName = 'OWNER'; // Creator is owner
            } else if (dto.inviteCode) {
                // Join existing organization
                // TODO: Implement proper invite code lookup. For now, assuming inviteCode is orgId or slug
                // In real app, we'd look up an Invite record.
                // Let's assume for MVP that we don't have invite codes yet, so we just fail if no orgName.
                // But wait, user asked for "Update registration to create/join organization".
                // Let's just find org by ID for now if provided as inviteCode, or throw.
                const org = await tx.organization.findFirst({
                    where: { OR: [{ id: dto.inviteCode }, { slug: dto.inviteCode }] } as any
                });

                if (!org) throw new BadRequestException('Invalid invite code');
                orgId = org.id;
            } else {
                throw new BadRequestException('Organization name or invite code required');
            }

            // Ensure Role exists
            let role = await tx.role.findUnique({ where: { name: roleName } });
            if (!role) {
                role = await tx.role.create({
                    data: {
                        name: roleName,
                        description: roleName === 'OWNER' ? 'Organization Owner' : 'Standard Employee',
                        isSystem: true,
                        scopes: roleName === 'OWNER' ? ['*'] : []
                    }
                });
            }

            return tx.user.create({
                data: {
                    email: dto.email,
                    fullName: dto.fullName,
                    passwordHash,
                    orgId: orgId,
                    roles: {
                        create: {
                            roleId: role.id
                        }
                    }
                },
                include: {
                    roles: {
                        include: { role: true }
                    }
                }
            });
        });

        const roleNames = user.roles.map(ur => ur.role.name);
        return this.signToken(user.id, user.email, roleNames, user.orgId);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
        if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const roleNames = user.roles.map(ur => ur.role.name);
        return this.signToken(user.id, user.email, roleNames, user.orgId);
    }

    async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string; googleId: string; accessToken?: string; refreshToken?: string }) {
        let user = await this.prisma.user.findUnique({
            where: { email: details.email },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });

        if (user) {
            // Link Google ID if not linked
            if (!user.googleId) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: details.googleId },
                    include: {
                        roles: {
                            include: { role: true }
                        }
                    }
                });
            }
        } else {
            // Create new user
            user = await this.prisma.$transaction(async (tx) => {
                const org = await tx.organization.create({
                    data: { name: `${details.firstName}'s Organization` },
                });

                // Ensure OWNER role exists
                let ownerRole = await tx.role.findUnique({ where: { name: 'OWNER' } });
                if (!ownerRole) {
                    ownerRole = await tx.role.create({
                        data: { name: 'OWNER', description: 'Organization Owner', isSystem: true, scopes: ['*'] }
                    });
                }

                return tx.user.create({
                    data: {
                        email: details.email,
                        fullName: `${details.firstName} ${details.lastName}`,
                        googleId: details.googleId,
                        orgId: org.id,
                        profile: {
                            create: {
                                avatarUrl: details.picture,
                            }
                        },
                        roles: {
                            create: {
                                roleId: ownerRole.id
                            }
                        }
                    },
                    include: {
                        roles: {
                            include: { role: true }
                        }
                    }
                });
            });
        }

        // Save/Update Google Tokens
        if (details.accessToken) {
            await this.prisma.integration.upsert({
                where: {
                    userId_type: {
                        userId: user.id,
                        type: 'CALENDAR', // Using CALENDAR for now as it's the main use case
                    },
                },
                update: {
                    credentials: {
                        accessToken: details.accessToken,
                        refreshToken: details.refreshToken,
                    },
                    isEnabled: true,
                },
                create: {
                    userId: user.id,
                    type: 'CALENDAR',
                    credentials: {
                        accessToken: details.accessToken,
                        refreshToken: details.refreshToken,
                    },
                    isEnabled: true,
                },
            });
        }

        return user;
    }

    async loginWithGoogle(user: any) {
        // User from validateGoogleUser already has roles included
        const roleNames = user.roles ? user.roles.map((ur: any) => ur.role.name) : [];
        return this.signToken(user.id, user.email, roleNames, user.orgId);
    }

    private async signToken(userId: string, email: string, roles: string[], organizationId: string) {
        const payload = { sub: userId, email, roles, orgId: organizationId };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
