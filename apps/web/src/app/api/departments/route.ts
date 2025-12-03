import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// GET /api/departments - List all departments
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const departments = await prisma.department.findMany({
            where: { orgId },
            include: {
                // manager: { // Commented out - relation not present in this schema version
                //     select: {
                //         id: true,
                //         fullName: true,
                //         email: true,
                //     },
                // },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch departments' },
            { status: 500 }
        );
    }
}

// POST /api/departments - Create a new department
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { name, description, managerId } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const department = await prisma.department.create({
            data: {
                name,
                managerId,
                orgId,
            },
            include: {
                // manager: { // Commented out - relation not present in this schema version
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
        console.error('Error creating department:', error);
        return NextResponse.json(
            { error: 'Failed to create department' },
            { status: 500 }
        );
    }
}
