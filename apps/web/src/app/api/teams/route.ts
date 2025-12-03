import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// GET /api/teams - List all teams
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const teams = await prisma.team.findMany({
            where: { orgId },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                // manager: { // Commented out - relation not present in this schema version
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
            orderBy: { name: 'asc' },
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

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { name, description, deptId, managerId } = body;

        if (!name || !deptId) {
            return NextResponse.json(
                { error: 'Name and department are required' },
                { status: 400 }
            );
        }

        const team = await prisma.team.create({
            data: {
                name,
                description,
                deptId,
                managerId,
                orgId,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                // manager: { // Commented out - relation not present in this schema version
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
        console.error('Error creating team:', error);
        return NextResponse.json(
            { error: 'Failed to create team' },
            { status: 500 }
        );
    }
}
