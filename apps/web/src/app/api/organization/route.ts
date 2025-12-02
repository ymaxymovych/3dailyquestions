import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// GET /api/organization - Get organization details
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const organization = await prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                slug: true,
                domains: true,
                settings: true,
                aiPolicy: true,
                plan: true,
                status: true,
                maxUsers: true,
                _count: {
                    select: {
                        users: true,
                        departments: true,
                    },
                },
            },
        });

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json(organization);
    } catch (error) {
        console.error('Error fetching organization:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organization' },
            { status: 500 }
        );
    }
}

// PATCH /api/organization - Update organization settings
export async function PATCH(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { name, settings, aiPolicy } = body;

        const organization = await prisma.organization.update({
            where: { id: orgId },
            data: {
                ...(name && { name }),
                ...(settings && { settings }),
                ...(aiPolicy && { aiPolicy }),
            },
        });

        return NextResponse.json(organization);
    } catch (error) {
        console.error('Error updating organization:', error);
        return NextResponse.json(
            { error: 'Failed to update organization' },
            { status: 500 }
        );
    }
}
