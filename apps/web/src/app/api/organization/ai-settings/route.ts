import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// PATCH /api/organization/ai-settings - Update organization AI policy
export async function PATCH(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { provider, tone } = body;

        // Fetch current policy to merge
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { aiPolicy: true }
        });

        const currentPolicy = (org?.aiPolicy as Record<string, any>) || {};

        const updatedPolicy = {
            ...currentPolicy,
            provider,
            tone
        };

        const organization = await prisma.organization.update({
            where: { id: orgId },
            data: {
                aiPolicy: updatedPolicy,
            },
        });

        return NextResponse.json(organization);
    } catch (error) {
        console.error('Error updating organization AI settings:', error);
        return NextResponse.json(
            { error: 'Failed to update organization AI settings' },
            { status: 500 }
        );
    }
}
