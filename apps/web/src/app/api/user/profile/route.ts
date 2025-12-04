import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        // MOCK AUTH
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { fullName, bio, jobTitle } = body;

        // Update User and UserProfile
        const user = await prisma.user.update({
            where: { id: mockUser.id },
            data: {
                fullName,
                profile: {
                    upsert: {
                        create: {
                            bio,
                            jobTitle,
                        },
                        update: {
                            bio,
                            jobTitle,
                        }
                    }
                }
            },
            include: {
                profile: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json(
            { error: 'Failed to update user profile' },
            { status: 500 }
        );
    }
}
