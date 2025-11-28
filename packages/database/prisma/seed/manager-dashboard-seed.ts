import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedManagerDashboard() {
    console.log('🌱 Seeding Manager Dashboard test data...');

    // Find or create Organization
    let org = await prisma.organization.findFirst();
    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: 'Test Organization',
                slug: 'test-org',
                plan: 'enterprise'
            }
        });
        console.log('✅ Created default organization');
    }

    // Find or create Sales Department
    const salesDept = await prisma.department.upsert({
        where: { id: 'sales-dept-id' },
        update: {},
        create: {
            id: 'sales-dept-id',
            name: 'Sales',
            orgId: org.id,
        },
    });

    // Find Sales SDR role archetype
    const sdrRole = await prisma.roleArchetype.findFirst({
        where: { code: 'SALES_SDR' },
    });

    const aeRole = await prisma.roleArchetype.findFirst({
        where: { code: 'SALES_AE' },
    });

    if (!sdrRole || !aeRole) {
        console.log('⚠️  Role archetypes not found. Run roles-seed.ts first.');
        return;
    }

    // Create Sales Manager (you can use existing user or create new)
    const manager = await prisma.user.upsert({
        where: { email: 'sales.manager@test.com' },
        update: {},
        create: {
            email: 'sales.manager@test.com',
            fullName: 'Alex Manager',
            passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // dummy hash
            orgId: salesDept.orgId,
            deptId: salesDept.id,
            roleArchetypeId: aeRole.id,
        },
    });

    // Update department manager
    await prisma.department.update({
        where: { id: salesDept.id },
        data: { managerId: manager.id },
    });

    console.log(`✅ Created Sales Manager: ${manager.email}`);

    // Create 6 SDR/AE employees
    const employees = [
        { name: 'John Smith', email: 'john.smith@test.com', role: sdrRole.id },
        { name: 'Emma Johnson', email: 'emma.johnson@test.com', role: sdrRole.id },
        { name: 'Michael Brown', email: 'michael.brown@test.com', role: aeRole.id },
        { name: 'Sarah Davis', email: 'sarah.davis@test.com', role: sdrRole.id },
        { name: 'David Wilson', email: 'david.wilson@test.com', role: aeRole.id },
        { name: 'Lisa Anderson', email: 'lisa.anderson@test.com', role: sdrRole.id },
    ];

    const createdEmployees = [];
    for (const emp of employees) {
        const user = await prisma.user.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                email: emp.email,
                fullName: emp.name,
                passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
                orgId: salesDept.orgId,
                deptId: salesDept.id,
                roleArchetypeId: emp.role,
            },
        });
        createdEmployees.push(user);
        console.log(`✅ Created employee: ${user.email}`);
    }

    // Generate reports for last 3 days
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    const dates = [dayBeforeYesterday, yesterday, today];

    // Scenario 1: John & Emma - all good (submitted, has Big task)
    for (const date of dates) {
        await createReport(createdEmployees[0].id, date, {
            hasBigTask: true,
            hasHelpRequest: false,
            submitted: true,
        });
        await createReport(createdEmployees[1].id, date, {
            hasBigTask: true,
            hasHelpRequest: false,
            submitted: true,
        });
    }

    // Scenario 2: Michael - not submitted today
    await createReport(createdEmployees[2].id, dayBeforeYesterday, {
        hasBigTask: true,
        hasHelpRequest: false,
        submitted: true,
    });
    await createReport(createdEmployees[2].id, yesterday, {
        hasBigTask: true,
        hasHelpRequest: false,
        submitted: true,
    });
    // No report for today

    // Scenario 3: Sarah - has blocker (help request)
    for (const date of dates) {
        await createReport(createdEmployees[3].id, date, {
            hasBigTask: true,
            hasHelpRequest: true,
            submitted: true,
        });
    }

    // Scenario 4: David - no Big task for 2 days
    for (const date of dates) {
        await createReport(createdEmployees[4].id, date, {
            hasBigTask: false,
            hasHelpRequest: false,
            submitted: true,
        });
    }

    // Scenario 5: Lisa - overloaded (many Medium/Small tasks)
    for (const date of dates) {
        await createReport(createdEmployees[5].id, date, {
            hasBigTask: false,
            hasHelpRequest: false,
            submitted: true,
            overloaded: true,
        });
    }

    console.log('✅ Manager Dashboard test data seeded successfully!');
}

async function createReport(
    userId: string,
    date: Date,
    scenario: {
        hasBigTask: boolean;
        hasHelpRequest: boolean;
        submitted: boolean;
        overloaded?: boolean;
    }
) {
    const dateOnly = new Date(date.toISOString().split('T')[0]);

    const report = await prisma.dailyReport.upsert({
        where: {
            userId_date: {
                userId,
                date: dateOnly,
            },
        },
        update: {},
        create: {
            userId,
            date: dateOnly,
            status: scenario.submitted ? 'PUBLISHED' : 'DRAFT',
            yesterdayBig: [
                {
                    title: 'Completed sales calls',
                    timeboxH: 4,
                },
            ],
            yesterdayMedium: [
                {
                    title: 'Updated CRM records',
                    timeboxH: 1,
                },
            ],
            yesterdaySmall: {
                items: ['Email follow-ups', 'Team standup'],
            },
            yesterdayNote: 'Good progress on pipeline',
            todayBig: scenario.hasBigTask
                ? [
                    {
                        title: 'Close 2 deals',
                        timeboxH: 5,
                    },
                ]
                : [],
            todayMedium: scenario.overloaded
                ? [
                    { title: 'Task 1', timeboxH: 2 },
                    { title: 'Task 2', timeboxH: 2 },
                    { title: 'Task 3', timeboxH: 2 },
                    { title: 'Task 4', timeboxH: 2 },
                ]
                : [
                    {
                        title: 'Prepare demo',
                        timeboxH: 2,
                    },
                ],
            todaySmall: scenario.overloaded
                ? {
                    items: [
                        'Small task 1',
                        'Small task 2',
                        'Small task 3',
                        'Small task 4',
                        'Small task 5',
                    ],
                }
                : {
                    items: ['Check emails', 'Update notes'],
                },
            todayNote: 'Focus on closing deals',
            mood: 4,
            wellbeing: 'Feeling productive',
        },
    });

    if (scenario.hasHelpRequest) {
        await prisma.helpRequest.upsert({
            where: {
                id: `help-${userId}-${dateOnly.toISOString()}`,
            },
            update: {},
            create: {
                id: `help-${userId}-${dateOnly.toISOString()}`,
                reportId: report.id,
                text: 'Need help with CRM integration issue',
                assigneeId: userId, // In real scenario, this would be manager
                dueDate: new Date(Date.now() + 86400000), // Tomorrow
                priority: 'HIGH',
            },
        });
    }
}

seedManagerDashboard()
    .catch((e) => {
        console.error('❌ Error seeding Manager Dashboard:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
