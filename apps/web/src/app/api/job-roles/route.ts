import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// GET /api/job-roles - List all job roles
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const jobRoles = await prisma.jobRole.findMany({
            where: { orgId },
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
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(jobRoles);
    } catch (error) {
        console.error('Error fetching job roles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job roles' },
            { status: 500 }
        );
    }
}

// POST /api/job-roles - Create a new job role
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { name, level, archetypeId, mission, responsibilities } = body;

        if (!name || !archetypeId) {
            return NextResponse.json(
                { error: 'Name and archetype are required' },
                { status: 400 }
            );
        }

        const jobRole = await prisma.jobRole.create({
            data: {
                name,
                level,
                archetypeId,
                mission,
                responsibilities,
                orgId,
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
        console.error('Error creating job role:', error);
        return NextResponse.json(
            { error: 'Failed to create job role' },
            { status: 500 }
        );
    }
}
