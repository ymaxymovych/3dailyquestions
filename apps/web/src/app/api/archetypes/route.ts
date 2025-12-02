import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// GET /api/archetypes - List all role archetypes with departments
export async function GET(request: NextRequest) {
    try {


        const archetypes = await prisma.roleArchetype.findMany({
            include: {
                departmentArchetype: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                    },
                },
                kpis: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        unit: true,
                        direction: true,
                        frequency: true,
                    },
                },
            },
            orderBy: [
                { departmentArchetype: { name: 'asc' } },
                { level: 'asc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json(archetypes);
    } catch (error) {
        console.error('Error fetching archetypes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch archetypes' },
            { status: 500 }
        );
    }
}
