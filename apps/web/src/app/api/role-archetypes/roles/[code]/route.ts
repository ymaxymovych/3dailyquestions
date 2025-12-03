import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

// GET /api/role-archetypes/roles/[code]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const role = await prisma.roleArchetype.findUnique({
            where: { code },
            include: {
                kpis: true,
                departmentArchetype: true,
            },
        });

        if (!role) {
            return NextResponse.json({ error: 'Role archetype not found' }, { status: 404 });
        }

        return NextResponse.json(role);
    } catch (error) {
        console.error('Error fetching role archetype:', error);
        return NextResponse.json(
            { error: 'Failed to fetch role archetype' },
            { status: 500 }
        );
    }
}
