import { PrismaClient } from '@prisma/client';
import { DEPARTMENTS_LIBRARY } from './roles-library';

const prisma = new PrismaClient();

async function seedRoleArchetypes() {
    console.log('🎭 Seeding Role Archetypes...');

    for (const dept of DEPARTMENTS_LIBRARY) {
        console.log(`\n📂 Department: ${dept.name} (${dept.code})`);

        // Create Department Archetype
        const departmentArchetype = await prisma.departmentArchetype.upsert({
            where: { code: dept.code },
            update: {
                name: dept.name,
                description: dept.description,
            },
            create: {
                code: dept.code,
                name: dept.name,
                description: dept.description,
            },
        });

        console.log(`  ✅ Created department: ${departmentArchetype.name}`);

        // Create Roles for this department
        for (const role of dept.roles) {
            console.log(`    🎭 Role: ${role.name} (${role.code})`);

            const roleArchetype = await prisma.roleArchetype.upsert({
                where: { code: role.code },
                update: {
                    name: role.name,
                    level: role.level,
                    description: role.description,
                },
                create: {
                    code: role.code,
                    name: role.name,
                    level: role.level,
                    description: role.description,
                    departmentArchetypeId: departmentArchetype.id,
                },
            });

            // Create KPIs for this role
            for (const kpi of role.kpis) {
                await prisma.kPITemplate.upsert({
                    where: { code: kpi.code },
                    update: {
                        name: kpi.name,
                        description: kpi.description,
                        unit: kpi.unit,
                        direction: kpi.direction === 'більше краще' ? 'HIGHER_BETTER' :
                            kpi.direction === 'менше краще' ? 'LOWER_BETTER' : 'TARGET_VALUE',
                        frequency: kpi.frequency,
                    },
                    create: {
                        code: kpi.code,
                        name: kpi.name,
                        description: kpi.description,
                        unit: kpi.unit,
                        direction: kpi.direction === 'більше краще' ? 'HIGHER_BETTER' :
                            kpi.direction === 'менше краще' ? 'LOWER_BETTER' : 'TARGET_VALUE',
                        frequency: kpi.frequency,
                        roleArchetypeId: roleArchetype.id,
                    },
                });
            }

            console.log(`      ✓ ${role.kpis.length} KPIs`);
        }

        console.log(`  ✅ Completed: ${dept.roles.length} roles`);
    }

    console.log('\n📊 Summary:');
    const departmentCount = await prisma.departmentArchetype.count();
    const roleCount = await prisma.roleArchetype.count();
    const kpiCount = await prisma.kPITemplate.count();

    console.log(`  - ${departmentCount} Departments`);
    console.log(`  - ${roleCount} Roles`);
    console.log(`  - ${kpiCount} KPI Templates`);
}

async function main() {
    console.log('🌱 Starting Role Archetypes Seed...\n');

    try {
        await seedRoleArchetypes();
        console.log('\n✅ Role Archetypes seeding completed!');
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
