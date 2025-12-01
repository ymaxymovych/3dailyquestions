import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { DEPARTMENTS_DATA } from './data';

async function seedArchetypes() {
    console.log('🌱 Seeding Department Archetypes and Role Archetypes...');

    for (const deptData of DEPARTMENTS_DATA) {
        console.log(`\nProcessing Department: ${deptData.name} (${deptData.code})`);

        // 1. Create Department Archetype
        const dept = await prisma.departmentArchetype.upsert({
            where: { code: deptData.code },
            update: {
                name: deptData.name,
                description: deptData.description
            },
            create: {
                code: deptData.code,
                name: deptData.name,
                description: deptData.description,
            },
        });

        // 2. Create Roles and KPIs
        for (const roleData of deptData.roles) {
            console.log(`  - Role: ${roleData.name} (${roleData.code})`);

            const role = await prisma.roleArchetype.upsert({
                where: { code: roleData.code },
                update: {
                    name: roleData.name,
                    level: roleData.level,
                    description: roleData.description,
                    departmentArchetypeId: dept.id,
                    reportTemplate: roleData.reportTemplate as any
                },
                create: {
                    code: roleData.code,
                    name: roleData.name,
                    level: roleData.level,
                    description: roleData.description,
                    departmentArchetypeId: dept.id,
                    reportTemplate: roleData.reportTemplate as any
                },
            });

            // 3. Create KPIs
            for (const kpiData of roleData.kpis) {
                await prisma.kPITemplate.upsert({
                    where: { code: kpiData.code },
                    update: {
                        name: kpiData.name,
                        unit: kpiData.unit,
                        direction: kpiData.direction,
                        frequency: kpiData.frequency,
                        roleArchetypeId: role.id
                    },
                    create: {
                        code: kpiData.code,
                        name: kpiData.name,
                        description: kpiData.description || undefined, // Handle optional description if added to data.ts later
                        unit: kpiData.unit,
                        direction: kpiData.direction,
                        frequency: kpiData.frequency,
                        roleArchetypeId: role.id,
                    },
                });
            }
        }
    }

    console.log('\n🎉 Archetype seeding complete!');
}

seedArchetypes()
    .catch((e) => {
        console.error('❌ Error seeding archetypes:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
