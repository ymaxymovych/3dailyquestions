import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// PATCH /api/departments/[id] - Update a department
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
        const { name, description, managerId } = body;

        const department = await prisma.department.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(managerId !== undefined && { managerId }),
            },
            include: {
                // manager: { // Removed because it might cause errors if relation is not set up correctly in this version
                //     select: {
                //         id: true,
                //         fullName: true,
                //         email: true,
                //     },
                // },
                teams: true,
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        return NextResponse.json(
            { error: 'Failed to update department' },
            { status: 500 }
        );
    }
}

// DELETE /api/departments/[id] - Delete a department
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

        await prisma.department.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json(
            { error: 'Failed to delete department' },
            { status: 500 }
        );
    }
}
