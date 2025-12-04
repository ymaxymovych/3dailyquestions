import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// GET /api/departments/[id]/teams - Get teams in a department
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // MOCK AUTH
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const teams = await prisma.team.findMany({
            where: {
                deptId: id,
                orgId: mockUser.orgId
            },
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: { users: true }
                }
            }
        });

        return NextResponse.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
}
