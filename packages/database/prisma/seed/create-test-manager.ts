import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestManager() {
    console.log('Creating test manager for load testing...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create or update test manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: {},
        create: {
            email: 'manager@example.com',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'Manager',
            role: 'MANAGER',
        },
    });

    console.log('✅ Test manager created:', manager.email);
    console.log('   Email: manager@example.com');
    console.log('   Password: password123');
}

createTestManager()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
