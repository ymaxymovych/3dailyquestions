import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// GET /api/setup/user/status - Get user wizard status
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }

        return NextResponse.json({
            userWizardCompleted: mockUser.userWizardCompleted,
            userWizardSkipped: mockUser.userWizardSkipped,
            currentStep: mockUser.userCurrentStep,
            // Also return org status so user wizard knows if it can proceed
            orgId: mockUser.orgId,
        });
    } catch (error) {
        console.error('Error fetching user setup status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user setup status' },
            { status: 500 }
        );
    }
}

// POST /api/setup/user/status - Update user wizard state
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }

        const body = await request.json();
        const { completed, skipped, currentStep } = body;

        const updateData: any = {};
        if (completed !== undefined) updateData.userWizardCompleted = completed;
        if (skipped !== undefined) updateData.userWizardSkipped = skipped;
        if (currentStep !== undefined) updateData.userCurrentStep = currentStep;

        const updatedUser = await prisma.user.update({
            where: { id: mockUser.id },
            data: updateData,
            select: {
                userWizardCompleted: true,
                userWizardSkipped: true,
                userCurrentStep: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user setup status:', error);
        return NextResponse.json(
            { error: 'Failed to update user setup status' },
            { status: 500 }
        );
    }
}
