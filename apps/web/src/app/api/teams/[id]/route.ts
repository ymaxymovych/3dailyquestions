import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// PATCH /api/teams/[id] - Update a team
export async function PATCH(
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
        const { name, description, deptId, managerId } = body;

        const team = await prisma.team.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(deptId && { deptId }),
                ...(managerId !== undefined && { managerId }),
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                // manager: { // Commented out to prevent potential relation errors during recovery
                //     select: {
                //         id: true,
                //         fullName: true,
                //         email: true,
                //     },
                // },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        return NextResponse.json(team);
    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json(
            { error: 'Failed to update team' },
            { status: 500 }
        );
    }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
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

        await prisma.team.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting team:', error);
        return NextResponse.json(
            { error: 'Failed to delete team' },
            { status: 500 }
        );
    }
}
