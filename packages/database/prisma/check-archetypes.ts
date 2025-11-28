import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('🔍 Checking archetypes...');

    const archetypes = await prisma.departmentArchetype.findMany({
        include: { roles: true }
    });

    console.log(`Found ${archetypes.length} department archetypes:`);
    archetypes.forEach(a => {
        console.log(`- ${a.name} (${a.code}): ${a.roles.length} roles`);
        a.roles.forEach(r => console.log(`  * ${r.name} (${r.code})`));
    });

    if (archetypes.length === 0) {
        console.log('❌ No archetypes found! Seed script might have failed.');
    } else {
        console.log('✅ Archetypes exist in DB.');
    }

    await prisma.$disconnect();
}

check();
