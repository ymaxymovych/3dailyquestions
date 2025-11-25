import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create system roles
    console.log('📝 Creating system roles...');

    const employee = await prisma.role.upsert({
        where: { name: 'EMPLOYEE' },
        update: {
            description: 'Standard employee with basic access',
            scopes: [
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
            ],
            isSystem: true,
        },
        create: {
            name: 'EMPLOYEE',
            description: 'Standard employee with basic access',
            scopes: [
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${employee.name}`);

    const manager = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {
            description: 'Team manager with team oversight permissions',
            scopes: [
                // Employee scopes
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
                // Manager-specific scopes
                'read:all-profiles',
                'read:reports:team',
                'read:analytics',
                'manage:team-kpis',
            ],
            isSystem: true,
        },
        create: {
            name: 'MANAGER',
            description: 'Team manager with team oversight permissions',
            scopes: [
                // Employee scopes
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
                // Manager-specific scopes
                'read:all-profiles',
                'read:reports:team',
                'read:analytics',
                'manage:team-kpis',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${manager.name}`);

    const admin = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {
            description: 'System administrator with elevated permissions',
            scopes: [
                // Manager scopes
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
                'read:all-profiles',
                'read:reports:team',
                'read:analytics',
                'manage:team-kpis',
                // Admin-specific scopes
                'write:all-profiles',
                'manage:roles',
                'read:access-logs',
                'delete:reports',
                'manage:integrations',
                'write:system-config',
            ],
            isSystem: true,
        },
        create: {
            name: 'ADMIN',
            description: 'System administrator with elevated permissions',
            scopes: [
                // Manager scopes
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
                'read:all-profiles',
                'read:reports:team',
                'read:analytics',
                'manage:team-kpis',
                // Admin-specific scopes
                'write:all-profiles',
                'manage:roles',
                'read:access-logs',
                'delete:reports',
                'manage:integrations',
                'write:system-config',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${admin.name}`);

    const owner = await prisma.role.upsert({
        where: { name: 'OWNER' },
        update: {
            description: 'Business owner with full system access',
            scopes: [
                // All previous scopes
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
                'read:all-profiles',
                'read:reports:team',
                'read:analytics',
                'manage:team-kpis',
                'write:all-profiles',
                'manage:roles',
                'read:access-logs',
                'delete:reports',
                'manage:integrations',
                'write:system-config',
                // Owner-specific scopes
                'delete:users',
                'manage:organization',
                'full:access',
            ],
            isSystem: true,
        },
        create: {
            name: 'OWNER',
            description: 'Business owner with full system access',
            scopes: [
                // All previous scopes
                'read:own-profile',
                'write:own-profile',
                'read:reports',
                'write:reports',
                'read:projects',
                'write:projects',
                'read:tags',
                'write:tags',
                'read:all-profiles',
                'read:reports:team',
                'read:analytics',
                'manage:team-kpis',
                'write:all-profiles',
                'manage:roles',
                'read:access-logs',
                'delete:reports',
                'manage:integrations',
                'write:system-config',
                // Owner-specific scopes
                'delete:users',
                'manage:organization',
                'full:access',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${owner.name}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nCreated roles:');
    console.log(`  - EMPLOYEE: ${employee.scopes.length} scopes`);
    console.log(`  - MANAGER: ${manager.scopes.length} scopes`);
    console.log(`  - ADMIN: ${admin.scopes.length} scopes`);
    console.log(`  - OWNER: ${owner.scopes.length} scopes`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
