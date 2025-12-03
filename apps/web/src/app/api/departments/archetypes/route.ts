import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export const dynamic = 'force-dynamic';

// GET /api/departments/archetypes - List all department archetypes
export async function GET(request: NextRequest) {
    try {
        const archetypes = await prisma.departmentArchetype.findMany({
            include: {
                roles: {
                    orderBy: {
                        level: 'asc',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(archetypes);
    } catch (error) {
        console.error('Error fetching department archetypes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch department archetypes' },
            { status: 500 }
        );
    }
}
