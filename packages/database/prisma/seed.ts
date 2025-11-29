import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create system roles with comprehensive permissions
    console.log('📝 Creating system roles...');

    // EMPLOYEE: Basic access to own data
    const employee = await prisma.role.upsert({
        where: { name: 'EMPLOYEE' },
        update: {
            description: 'Standard employee with basic access',
            scopes: [
                // Daily Reports
                'daily-report.read',      // View own reports
                'daily-report.create',    // Create reports

                // Team Management
                'team.read',              // View team members

                // Projects & Tags
                'project.read',           // View projects
                'project.create',         // Create projects
                'tag.manage',             // Manage tags (own)

                // KPIs
                'kpi.read',               // View own KPIs
                'kpi.manage',             // Manage own KPIs
            ],
            isSystem: true,
        },
        create: {
            name: 'EMPLOYEE',
            description: 'Standard employee with basic access',
            scopes: [
                'daily-report.read',
                'daily-report.create',
                'team.read',
                'project.read',
                'project.create',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${employee.name} (${employee.scopes.length} permissions)`);

    // MANAGER: Employee + team oversight
    const manager = await prisma.role.upsert({
        where: { name: 'MANAGER' },
        update: {
            description: 'Team manager with team oversight permissions',
            scopes: [
                // Employee permissions
                'daily-report.read',
                'daily-report.create',
                'team.read',
                'project.read',
                'project.create',
                'tag.manage',
                'kpi.read',
                'kpi.manage',

                // Manager-specific: Daily Reports
                'daily-report.read.team', // View team reports

                // Manager-specific: Team Management
                'team.manage',            // Manage team members
                'department.read',        // View departments

                // Manager-specific: Projects
                'project.manage',         // Manage all projects

                // Manager-specific: KPIs
                'kpi.read.team',          // View team KPIs
            ],
            isSystem: true,
        },
        create: {
            name: 'MANAGER',
            description: 'Team manager with team oversight permissions',
            scopes: [
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'team.read',
                'team.manage',
                'department.read',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${manager.name} (${manager.scopes.length} permissions)`);

    // HR: Manager + department management
    const hr = await prisma.role.upsert({
        where: { name: 'HR' },
        update: {
            description: 'HR manager with full team and department access',
            scopes: [
                // Manager permissions
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'team.read',
                'team.manage',
                'department.read',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',

                // HR-specific
                'daily-report.read.all',  // View all reports
                'department.manage',      // Manage departments
                'org.read',               // View organization
                'org.invite',             // Invite users
            ],
            isSystem: true,
        },
        create: {
            name: 'HR',
            description: 'HR manager with full team and department access',
            scopes: [
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'daily-report.read.all',
                'team.read',
                'team.manage',
                'department.read',
                'department.manage',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',
                'org.read',
                'org.invite',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${hr.name} (${hr.scopes.length} permissions)`);

    // ADMIN: HR + system administration
    const admin = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {
            description: 'System administrator with elevated permissions',
            scopes: [
                // HR permissions
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'daily-report.read.all',
                'team.read',
                'team.manage',
                'department.read',
                'department.manage',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',
                'org.read',
                'org.invite',

                // Admin-specific: Organization
                'org.manage',             // Manage organization
                'org.billing',            // Manage billing

                // Admin-specific: KPIs
                'kpi.manage.all',         // Manage all KPIs

                // Admin-specific: Admin
                'roles.manage',           // Manage roles
                'integrations.manage',    // Manage integrations
                'access.view',            // View access logs
            ],
            isSystem: true,
        },
        create: {
            name: 'ADMIN',
            description: 'System administrator with elevated permissions',
            scopes: [
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'daily-report.read.all',
                'team.read',
                'team.manage',
                'department.read',
                'department.manage',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',
                'kpi.manage.all',
                'org.read',
                'org.manage',
                'org.invite',
                'org.billing',
                'roles.manage',
                'integrations.manage',
                'access.view',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${admin.name} (${admin.scopes.length} permissions)`);

    // OWNER: Full access
    const owner = await prisma.role.upsert({
        where: { name: 'OWNER' },
        update: {
            description: 'Business owner with full system access',
            scopes: [
                // All Admin permissions
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'daily-report.read.all',
                'team.read',
                'team.manage',
                'department.read',
                'department.manage',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',
                'kpi.manage.all',
                'org.read',
                'org.manage',
                'org.invite',
                'org.billing',
                'roles.manage',
                'integrations.manage',
                'access.view',

                // Owner-specific: Full control
                'full.access',            // Full system access
            ],
            isSystem: true,
        },
        create: {
            name: 'OWNER',
            description: 'Business owner with full system access',
            scopes: [
                'daily-report.read',
                'daily-report.create',
                'daily-report.read.team',
                'daily-report.read.all',
                'team.read',
                'team.manage',
                'department.read',
                'department.manage',
                'project.read',
                'project.create',
                'project.manage',
                'tag.manage',
                'kpi.read',
                'kpi.manage',
                'kpi.read.team',
                'kpi.manage.all',
                'org.read',
                'org.manage',
                'org.invite',
                'org.billing',
                'roles.manage',
                'integrations.manage',
                'access.view',
                'full.access',
            ],
            isSystem: true,
        },
    });
    console.log(`✅ Created/Updated role: ${owner.name} (${owner.scopes.length} permissions)`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Created roles with permissions:');
    console.log(`  - EMPLOYEE: ${employee.scopes.length} permissions`);
    console.log(`  - MANAGER: ${manager.scopes.length} permissions`);
    console.log(`  - HR: ${hr.scopes.length} permissions`);
    console.log(`  - ADMIN: ${admin.scopes.length} permissions`);
    console.log(`  - OWNER: ${owner.scopes.length} permissions`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
