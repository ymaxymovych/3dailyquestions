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

    // ==================== TEAM VIEW TEST DATA ====================
    console.log('\n🧪 Creating Team View test data...');

    // Create test organization
    const testOrg = await prisma.organization.upsert({
        where: { slug: 'test-company' },
        update: {},
        create: {
            name: 'Test Company',
            slug: 'test-company',
            plan: 'pro',
            status: 'active',
            maxUsers: 50,
            domains: ['test.com'],
        },
    });
    console.log(`✅ Created organization: ${testOrg.name}`);

    // Create Sales department
    const salesDept = await prisma.department.create({
        data: {
            name: 'Sales',
            orgId: testOrg.id,
        },
    });
    console.log(`✅ Created department: ${salesDept.name}`);

    // Create manager user
    const managerUser = await prisma.user.create({
        data: {
            email: 'manager@test.com',
            fullName: 'Alex Manager',
            passwordHash: '$2a$10$K7L/aOXqVqJ5Y5Y5Y5Y5YuN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', // password123
            orgId: testOrg.id,
            deptId: salesDept.id,
            status: 'ACTIVE',
        },
    });
    await prisma.userRole.create({
        data: {
            userId: managerUser.id,
            roleId: (await prisma.role.findUnique({ where: { name: 'MANAGER' } }))!.id,
        },
    });

    // Update department with manager
    await prisma.department.update({
        where: { id: salesDept.id },
        data: { managerId: managerUser.id },
    });
    console.log(`✅ Created manager: ${managerUser.fullName}`);

    // Create 4 team members
    const teamMembers = [];
    const names = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Davis'];

    for (const name of names) {
        const user = await prisma.user.create({
            data: {
                email: `${name.toLowerCase().replace(' ', '.')}@test.com`,
                fullName: name,
                passwordHash: '$2a$10$K7L/aOXqVqJ5Y5Y5Y5Y5YuN5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', // password123
                orgId: testOrg.id,
                deptId: salesDept.id,
                status: 'ACTIVE',
            },
        });
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: employee.id,
            },
        });
        teamMembers.push(user);
        console.log(`✅ Created employee: ${user.fullName}`);
    }

    // Create daily reports for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bigTasks = [
        'Close deal with Acme Corp ($50k)',
        'Prepare Q4 sales presentation',
        'Follow up with 10 warm leads',
        'Update CRM with last week\'s calls',
    ];

    const loadStatuses: ('BALANCED' | 'OVERLOADED' | 'UNDERLOADED')[] = ['BALANCED', 'OVERLOADED', 'BALANCED', 'UNDERLOADED'];

    for (let i = 0; i < teamMembers.length; i++) {
        const report = await prisma.dailyReport.create({
            data: {
                userId: teamMembers[i].id,
                orgId: testOrg.id,
                date: today,
                status: 'PUBLISHED',
                publishedAt: new Date(),
                visibility: 'TEAM',
                loadStatus: loadStatuses[i],
                todayBig: { text: bigTasks[i] },
                todayMedium: [
                    { text: 'Send follow-up emails' },
                    { text: 'Update sales pipeline' },
                ],
                yesterdayBig: { text: 'Completed client demo' },
            },
        });

        // Add blocker for one employee
        if (i === 1) {
            await prisma.helpRequest.create({
                data: {
                    reportId: report.id,
                    text: 'Waiting for legal approval on contract',
                    assigneeId: managerUser.id,
                    dueDate: new Date(Date.now() + 86400000), // tomorrow
                    priority: 'HIGH',
                },
            });
        }

        // Add reactions
        if (i < 2) {
            await prisma.dailyReportReaction.create({
                data: {
                    reportId: report.id,
                    userId: managerUser.id,
                    emoji: '👍',
                },
            });
        }

        console.log(`✅ Created daily report for: ${teamMembers[i].fullName}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Created roles with permissions:');
    console.log(`  - EMPLOYEE: ${employee.scopes.length} permissions`);
    console.log(`  - MANAGER: ${manager.scopes.length} permissions`);
    console.log(`  - HR: ${hr.scopes.length} permissions`);
    console.log(`  - ADMIN: ${admin.scopes.length} permissions`);
    console.log(`  - OWNER: ${owner.scopes.length} permissions`);
    console.log('\n🧪 Team View Test Data:');
    console.log(`  - Organization: ${testOrg.name}`);
    console.log(`  - Department: ${salesDept.name}`);
    console.log(`  - Manager: ${managerUser.fullName} (manager@test.com)`);
    console.log(`  - Team Members: ${teamMembers.length}`);
    console.log(`  - Daily Reports: ${teamMembers.length}`);
    console.log('\n🔑 Login with: manager@test.com (or any team member email)');
    console.log('📍 Navigate to: /daily-report/team');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
