import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateDepartments() {
    console.log('🔍 Finding your organization...');

    // Find Yaroslav's user
    const yaroslav = await prisma.user.findUnique({
        where: { email: 'yaroslav.maxymovych@gmail.com' },
        include: { org: true }
    });

    if (!yaroslav) {
        console.error('❌ User not found');
        process.exit(1);
    }

    const orgId = yaroslav.orgId;
    console.log(`✅ Found organization: ${yaroslav.org.name} (${orgId})`);

    // Fetch Department Archetypes
    console.log('📚 Fetching Department Archetypes...');
    const archetypes = await prisma.departmentArchetype.findMany({
        include: { roles: true }
    });

    if (archetypes.length === 0) {
        console.error('❌ No Department Archetypes found! Please run seed-archetypes.ts first.');
        return;
    }

    const createdDepts: Record<string, string> = {};

    console.log('🏗️ Creating departments based on archetypes...');
    for (const arch of archetypes) {
        const existing = await prisma.department.findFirst({
            where: { orgId, archetypeId: arch.id }
        });

        if (existing) {
            console.log(`  - ${arch.name} already exists`);
            createdDepts[arch.code] = existing.id;
        } else {
            // Check by name if archetype link is missing
            const existingByName = await prisma.department.findFirst({
                where: { orgId, name: arch.name }
            });

            if (existingByName) {
                console.log(`  - ${arch.name} exists (linking to archetype)`);
                await prisma.department.update({
                    where: { id: existingByName.id },
                    data: { archetypeId: arch.id }
                });
                createdDepts[arch.code] = existingByName.id;
            } else {
                const newDept = await prisma.department.create({
                    data: {
                        name: arch.name,
                        orgId,
                        archetypeId: arch.id
                    }
                });
                console.log(`  - Created ${arch.name}`);
                createdDepts[arch.code] = newDept.id;
            }
        }
    }

    // Distribute users and assign Role Archetypes
    console.log('👥 Distributing users and assigning roles...');

    const users = await prisma.user.findMany({
        where: { orgId },
        include: { roleArchetype: true }
    });

    // Helper to find role archetype by code
    const findRoleArch = (deptCode: string, roleCodeSuffix: string) => {
        const dept = archetypes.find(a => a.code === deptCode);
        return dept?.roles.find(r => r.code === `${deptCode}_${roleCodeSuffix}`);
    };

    for (const user of users) {
        let targetDeptCode = '';
        let targetRoleArchId: string | undefined;

        // Logic to assign departments and roles
        if (user.email.includes('yaroslav')) {
            targetDeptCode = 'OPS';
            const ops = archetypes.find(a => a.code === 'OPS');
            const ceoRole = ops?.roles.find(r => r.code === 'OPS_CEO');
            if (ceoRole) targetRoleArchId = ceoRole.id;
        }
        else if (user.email.includes('john') || user.email.includes('mike')) {
            targetDeptCode = 'PRODENG';
            // Assign Backend Dev role
            const role = findRoleArch('PRODENG', 'ENG_BACKEND');
            if (role) targetRoleArchId = role.id;
        }
        else if (user.email.includes('sarah')) {
            targetDeptCode = 'MKT';
            const mkt = archetypes.find(a => a.code === 'MKT');
            const mktRole = mkt?.roles.find(r => r.code === 'MKT_MANAGER'); // Or MKT_PERF
            if (mktRole) targetRoleArchId = mktRole.id;
        }
        else if (user.email.includes('emma')) {
            targetDeptCode = 'PRODENG';
            // Assign Frontend
            const prodEng = archetypes.find(a => a.code === 'PRODENG');
            const feRole = prodEng?.roles.find(r => r.code === 'ENG_FRONTEND');
            if (feRole) targetRoleArchId = feRole.id;
        }
        else if (user.email.includes('hod')) {
            targetDeptCode = 'SALES';
            // Assign Sales Manager or AE
            const sales = archetypes.find(a => a.code === 'SALES');
            const aeRole = sales?.roles.find(r => r.code === 'SALES_AE');
            if (aeRole) targetRoleArchId = aeRole.id;
        }
        else if (user.email.includes('ceo')) {
            targetDeptCode = 'SALES'; // Or OPS if real CEO
        }
        else if (user.email.includes('manager')) {
            targetDeptCode = 'SALES';
            const sales = archetypes.find(a => a.code === 'SALES');
            const sdrRole = sales?.roles.find(r => r.code === 'SALES_SDR');
            if (sdrRole) targetRoleArchId = sdrRole.id;
        }

        // Default to PRODENG if not matched (or keep existing)
        if (!targetDeptCode) {
            targetDeptCode = 'PRODENG';
        }

        const targetDeptId = createdDepts[targetDeptCode];

        if (targetDeptId && targetDeptId !== user.deptId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { deptId: targetDeptId }
            });
            console.log(`  - Moved ${user.fullName} to ${targetDeptCode}`);
        }

        // Assign Role Archetype if not set
        if (targetRoleArchId && user.roleArchetypeId !== targetRoleArchId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { roleArchetypeId: targetRoleArchId }
            });
            console.log(`  - Assigned Role Archetype to ${user.fullName}`);
        }
    }

    console.log('\n🎉 Departments populated from Archetypes and users distributed!');
    console.log('📍 Navigate to: /daily-report/team');
}

populateDepartments()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
