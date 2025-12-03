import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// PATCH /api/job-roles/[id] - Update a job role
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
        const { name, level, mission, responsibilities } = body;

        const jobRole = await prisma.jobRole.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(level && { level }),
                ...(mission !== undefined && { mission }),
                ...(responsibilities !== undefined && { responsibilities }),
            },
            include: {
                archetype: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        level: true,
                        departmentArchetype: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        return NextResponse.json(jobRole);
    } catch (error) {
        console.error('Error updating job role:', error);
        return NextResponse.json(
            { error: 'Failed to update job role' },
            { status: 500 }
        );
    }
}

// DELETE /api/job-roles/[id] - Delete a job role
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

        await prisma.jobRole.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting job role:', error);
        return NextResponse.json(
            { error: 'Failed to delete job role' },
            { status: 500 }
        );
    }
}
