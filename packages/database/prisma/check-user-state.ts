import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkState() {
    console.log('🔍 Checking All Users...');
    const users = await prisma.user.findMany({
        include: {
            org: true,
            department: true,
            roleArchetype: true
        }
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`\nUser: ${user.email}`);
        console.log(`  - ID: ${user.id}`);
        console.log(`  - Name: ${user.fullName}`);
        console.log(`  - Org: ${user.org?.name} (${user.orgId})`);
        console.log(`  - Dept: ${user.department?.name} (${user.deptId})`);
        console.log(`  - Role: ${user.roleArchetype?.name} (${user.roleArchetypeId})`);
    }

    console.log('\n📚 Checking Archetypes...');
    const deptArchs = await prisma.departmentArchetype.findMany({
        include: { roles: true }
    });

    console.log(`Found ${deptArchs.length} department archetypes.`);
}

checkState()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
