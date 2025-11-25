import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
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
}
