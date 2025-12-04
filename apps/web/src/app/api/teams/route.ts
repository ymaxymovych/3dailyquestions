import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, departmentId, description } = body;

        if (!name || !departmentId) {
            return NextResponse.json({ error: 'Name and Department ID are required' }, { status: 400 });
        }

        const team = await prisma.team.create({
            data: {
                name,
                description,
                deptId: departmentId,
                orgId: mockUser.orgId,
                managerId: mockUser.id // Creator becomes manager by default
            }
        });

        return NextResponse.json(team);
    } catch (error) {
        console.error('Error creating team:', error);
        return NextResponse.json(
            { error: 'Failed to create team' },
            { status: 500 }
        );
    }
}
