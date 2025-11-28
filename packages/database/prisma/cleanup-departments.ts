import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up department references...');

    try {
        // Use raw query to bypass Prisma's type checks if schema is out of sync
        // We need to clear deptId because the Department table might be missing or empty
        await prisma.$executeRawUnsafe(`UPDATE "User" SET "deptId" = NULL`);
        console.log('✅ Successfully cleared deptId from all users');
    } catch (error) {
        console.error('❌ Error clearing deptId:', error);
        // If table doesn't exist, that's fine too
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
