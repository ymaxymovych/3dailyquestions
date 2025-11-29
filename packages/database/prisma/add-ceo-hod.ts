import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCEOandHOD() {
    console.log('🔍 Finding your organization...');

    // Find Yaroslav's user
    const yaroslav = await prisma.user.findUnique({
        where: { email: 'yaroslav.maxymovych@gmail.com' },
    });

    if (!yaroslav) {
        console.error('❌ User not found');
        process.exit(1);
    }

    console.log(`✅ Found user in org: ${yaroslav.orgId}, dept: ${yaroslav.deptId}`);

    // Password hash for "password123" (pre-generated with bcrypt)
    const passwordHash = '$2a$10$rZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5uN5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z';

    // Get roles
    const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } });
    const managerRole = await prisma.role.findUnique({ where: { name: 'MANAGER' } });

    // Create CEO
    console.log('👔 Creating CEO...');
    const ceo = await prisma.user.create({
        data: {
            email: 'ceo@company.com',
            fullName: 'Robert CEO',
            passwordHash,
            orgId: yaroslav.orgId,
            deptId: yaroslav.deptId,
            status: 'ACTIVE',
        },
    });

    if (ownerRole) {
        await prisma.userRole.create({
            data: {
                userId: ceo.id,
                roleId: ownerRole.id,
            },
        });
    }

    console.log(`✅ Created CEO: ${ceo.fullName} (${ceo.email})`);

    // Create HOD
    console.log('👨‍💼 Creating HOD...');
    const hod = await prisma.user.create({
        data: {
            email: 'hod@company.com',
            fullName: 'Sarah HOD',
            passwordHash,
            orgId: yaroslav.orgId,
            deptId: yaroslav.deptId,
            status: 'ACTIVE',
        },
    });

    if (managerRole) {
        await prisma.userRole.create({
            data: {
                userId: hod.id,
                roleId: managerRole.id,
            },
        });
    }

    // Set HOD as department manager
    if (yaroslav.deptId) {
        await prisma.department.update({
            where: { id: yaroslav.deptId },
            data: { managerId: hod.id },
        });
    }

    console.log(`✅ Created HOD: ${hod.fullName} (${hod.email})`);

    // Create daily reports
    console.log('📝 Creating daily reports...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ceoReport = await prisma.dailyReport.create({
        data: {
            userId: ceo.id,
            orgId: yaroslav.orgId,
            date: today,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            visibility: 'TEAM',
            loadStatus: 'BALANCED',
            todayBig: { text: 'Review Q4 strategy and approve budget' },
            todayMedium: [
                { text: 'Meet with investors' },
                { text: 'Review team performance' },
            ],
            yesterdayBig: { text: 'Closed partnership deal with Microsoft' },
        },
    });

    const hodReport = await prisma.dailyReport.create({
        data: {
            userId: hod.id,
            orgId: yaroslav.orgId,
            date: today,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            visibility: 'TEAM',
            loadStatus: 'OVERLOADED',
            todayBig: { text: 'Finalize hiring plan for Q1' },
            todayMedium: [
                { text: 'Review team KPIs' },
                { text: 'Prepare budget presentation' },
            ],
            yesterdayBig: { text: 'Conducted 5 interviews' },
        },
    });

    // Add blocker for HOD
    await prisma.helpRequest.create({
        data: {
            reportId: hodReport.id,
            text: 'Need CEO approval for new headcount',
            assigneeId: ceo.id,
            dueDate: new Date(Date.now() + 86400000),
            priority: 'HIGH',
        },
    });

    console.log('✅ Created daily reports');

    console.log('\n🎉 Setup complete!');
    console.log('\n🔑 CEO Credentials:');
    console.log('  Email: ceo@company.com');
    console.log('  Password: password123');
    console.log('\n🔑 HOD Credentials:');
    console.log('  Email: hod@company.com');
    console.log('  Password: password123');
    console.log('\n📍 Navigate to: /daily-report/team');
}

createCEOandHOD()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
