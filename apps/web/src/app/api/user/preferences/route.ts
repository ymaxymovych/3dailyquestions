import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// PATCH /api/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
    try {
        // MOCK AUTH
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { workStart, workEnd, timezone, notifications } = body;

        // Update workSchedule JSON field directly on User model
        const user = await prisma.user.update({
            where: { id: mockUser.id },
            data: {
                workSchedule: {
                    start: workStart,
                    end: workEnd,
                    timezone
                }
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update user preferences' },
            { status: 500 }
        );
    }
}
