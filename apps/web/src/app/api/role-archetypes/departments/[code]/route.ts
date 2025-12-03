import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

// GET /api/role-archetypes/departments/[code]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const archetype = await prisma.departmentArchetype.findUnique({
            where: { code },
            include: {
                roles: {
                    orderBy: { level: 'asc' },
                },
            },
        });

        if (!archetype) {
            return NextResponse.json({ error: 'Department archetype not found' }, { status: 404 });
        }

        return NextResponse.json(archetype);
    } catch (error) {
        console.error('Error fetching department archetype:', error);
        return NextResponse.json(
            { error: 'Failed to fetch department archetype' },
            { status: 500 }
        );
    }
}
