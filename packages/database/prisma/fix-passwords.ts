import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixPasswords() {
    console.log('🔧 Fixing passwords...');

    // Generate proper bcrypt hash for "password123"
    const hash = await bcrypt.hash('password123', 10);
    console.log('Generated hash:', hash);

    // Update CEO
    const ceo = await prisma.user.findUnique({ where: { email: 'ceo@company.com' } });
    if (ceo) {
        await prisma.user.update({
            where: { id: ceo.id },
            data: { passwordHash: hash },
        });
        console.log('✅ Updated CEO password');
    } else {
        console.log('❌ CEO not found');
    }

    // Update HOD
    const hod = await prisma.user.findUnique({ where: { email: 'hod@company.com' } });
    if (hod) {
        await prisma.user.update({
            where: { id: hod.id },
            data: { passwordHash: hash },
        });
        console.log('✅ Updated HOD password');
    } else {
        console.log('❌ HOD not found');
    }

    // Update test users
    const testEmails = ['john.smith@test.com', 'sarah.johnson@test.com', 'mike.chen@test.com', 'emma.davis@test.com', 'manager@test.com'];
    for (const email of testEmails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: hash },
            });
            console.log(`✅ Updated ${email} password`);
        }
    }

    console.log('\n🎉 All passwords updated to: password123');
}

fixPasswords()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
