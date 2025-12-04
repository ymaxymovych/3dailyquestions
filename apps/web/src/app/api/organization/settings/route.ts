import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// PATCH /api/organization/settings - Update organization work schedule
export async function PATCH(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { workSchedule } = body;

        // Fetch current settings to merge
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { settings: true }
        });

        const currentSettings = (org?.settings as Record<string, any>) || {};

        const updatedSettings = {
            ...currentSettings,
            ...workSchedule // Merge workSchedule into settings
        };

        const organization = await prisma.organization.update({
            where: { id: orgId },
            data: {
                settings: updatedSettings,
            },
        });

        return NextResponse.json(organization);
    } catch (error) {
        console.error('Error updating organization settings:', error);
        return NextResponse.json(
            { error: 'Failed to update organization settings' },
            { status: 500 }
        );
    }
}
