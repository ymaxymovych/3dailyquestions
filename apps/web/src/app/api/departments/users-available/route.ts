import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

// GET /api/departments/users-available - List users for assignment
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const users = await prisma.user.findMany({
            where: {
                orgId: orgId,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                deptId: true,
                roleArchetype: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: {
                fullName: 'asc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching available users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
