import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTemplates() {
    console.log('🔍 Checking Report Templates...');

    const rolesToCheck = ['SALES_SDR', 'ENG_DEV', 'OPS_CEO'];

    for (const code of rolesToCheck) {
        const role = await prisma.roleArchetype.findUnique({
            where: { code }
        });

        if (!role) {
            console.log(`❌ Role ${code} not found`);
            continue;
        }

        console.log(`\n👤 Role: ${role.name} (${role.code})`);
        if (role.reportTemplate) {
            console.log('✅ Template found:');
            console.log(JSON.stringify(role.reportTemplate, null, 2).substring(0, 200) + '...');
        } else {
            console.log('❌ No template found');
        }
    }
}

checkTemplates()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
