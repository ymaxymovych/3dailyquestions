import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// POST /api/teams/[id]/join - Join a team
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // MOCK AUTH
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update user's team
        const user = await prisma.user.update({
            where: { id: mockUser.id },
            data: {
                teamId: id
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error joining team:', error);
        return NextResponse.json(
            { error: 'Failed to join team' },
            { status: 500 }
        );
    }
}
