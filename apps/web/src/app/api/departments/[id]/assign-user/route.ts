import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// POST /api/departments/[id]/assign-user - Assign a user to a department
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { userId, roleArchetypeId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Verify user belongs to org
        const user = await prisma.user.findFirst({
            where: { id: userId, orgId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in organization' }, { status: 404 });
        }

        // Verify department belongs to org
        const department = await prisma.department.findFirst({
            where: { id, orgId },
        });

        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                deptId: id,
                roleArchetypeId: roleArchetypeId || null,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error assigning user:', error);
        return NextResponse.json(
            { error: 'Failed to assign user' },
            { status: 500 }
        );
    }
}
