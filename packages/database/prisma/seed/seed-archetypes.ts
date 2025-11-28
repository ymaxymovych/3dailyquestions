import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedArchetypes() {
    console.log('🌱 Seeding Department Archetypes and Role Archetypes...');

    // 1. Create Department Archetypes
    const sales = await prisma.departmentArchetype.upsert({
        where: { code: 'SALES' },
        update: {},
        create: {
            code: 'SALES',
            name: 'Sales',
            description: 'Revenue generation, customer acquisition, and account management',
        },
    });

    const prodeng = await prisma.departmentArchetype.upsert({
        where: { code: 'PRODENG' },
        update: {},
        create: {
            code: 'PRODENG',
            name: 'Product & Engineering',
            description: 'Product development, engineering, and technical operations',
        },
    });

    const marketing = await prisma.departmentArchetype.upsert({
        where: { code: 'MKT' },
        update: {},
        create: {
            code: 'MKT',
            name: 'Marketing',
            description: 'Brand, demand generation, content, and growth',
        },
    });

    const cs = await prisma.departmentArchetype.upsert({
        where: { code: 'CS' },
        update: {},
        create: {
            code: 'CS',
            name: 'Customer Success',
            description: 'Customer onboarding, support, and retention',
        },
    });

    const ops = await prisma.departmentArchetype.upsert({
        where: { code: 'OPS' },
        update: {},
        create: {
            code: 'OPS',
            name: 'Operations',
            description: 'Finance, HR, legal, and administrative functions',
        },
    });

    console.log('✅ Department Archetypes created');

    // 2. Create Role Archetypes for Sales
    const sdr = await prisma.roleArchetype.upsert({
        where: { code: 'SALES_SDR' },
        update: {},
        create: {
            code: 'SALES_SDR',
            name: 'SDR / Lead Generator',
            level: 'IC',
            description: 'Outbound prospecting, cold calling, and lead qualification',
            departmentArchetypeId: sales.id,
        },
    });

    const ae = await prisma.roleArchetype.upsert({
        where: { code: 'SALES_AE' },
        update: {},
        create: {
            code: 'SALES_AE',
            name: 'Account Executive',
            level: 'IC',
            description: 'Closing deals, demos, and managing sales pipeline',
            departmentArchetypeId: sales.id,
        },
    });

    const csm = await prisma.roleArchetype.upsert({
        where: { code: 'SALES_CSM' },
        update: {},
        create: {
            code: 'SALES_CSM',
            name: 'Customer Success Manager',
            level: 'IC',
            description: 'Customer onboarding, retention, and upselling',
            departmentArchetypeId: sales.id,
        },
    });

    console.log('✅ Sales Role Archetypes created');

    // 3. Create Role Archetypes for Engineering
    const backendDev = await prisma.roleArchetype.upsert({
        where: { code: 'ENG_BACKEND' },
        update: {},
        create: {
            code: 'ENG_BACKEND',
            name: 'Backend Developer',
            level: 'IC',
            description: 'Server-side development, APIs, databases, and system architecture',
            departmentArchetypeId: prodeng.id,
        },
    });

    const frontendDev = await prisma.roleArchetype.upsert({
        where: { code: 'ENG_FRONTEND' },
        update: {},
        create: {
            code: 'ENG_FRONTEND',
            name: 'Frontend Developer',
            level: 'IC',
            description: 'User interface development, web applications, and client-side logic',
            departmentArchetypeId: prodeng.id,
        },
    });

    const qa = await prisma.roleArchetype.upsert({
        where: { code: 'ENG_QA' },
        update: {},
        create: {
            code: 'ENG_QA',
            name: 'QA Engineer',
            level: 'IC',
            description: 'Quality assurance, testing, and bug tracking',
            departmentArchetypeId: prodeng.id,
        },
    });

    console.log('✅ Engineering Role Archetypes created');

    // 4. Create KPI Templates for SDR
    await prisma.kPITemplate.upsert({
        where: { code: 'SDR_CALLS_DAILY' },
        update: {},
        create: {
            code: 'SDR_CALLS_DAILY',
            name: 'Calls per day',
            description: 'Number of outbound calls made',
            unit: 'calls',
            direction: 'HIGHER_BETTER',
            frequency: 'DAILY',
            roleArchetypeId: sdr.id,
        },
    });

    await prisma.kPITemplate.upsert({
        where: { code: 'SDR_CONTACTS_DAILY' },
        update: {},
        create: {
            code: 'SDR_CONTACTS_DAILY',
            name: 'Contacts reached',
            description: 'Number of successful contacts made',
            unit: 'contacts',
            direction: 'HIGHER_BETTER',
            frequency: 'DAILY',
            roleArchetypeId: sdr.id,
        },
    });

    await prisma.kPITemplate.upsert({
        where: { code: 'SDR_MEETINGS_WEEKLY' },
        update: {},
        create: {
            code: 'SDR_MEETINGS_WEEKLY',
            name: 'Meetings booked',
            description: 'Number of meetings scheduled with prospects',
            unit: 'meetings',
            direction: 'HIGHER_BETTER',
            frequency: 'WEEKLY',
            roleArchetypeId: sdr.id,
        },
    });

    console.log('✅ SDR KPI Templates created');

    // 5. Create KPI Templates for Backend Dev
    await prisma.kPITemplate.upsert({
        where: { code: 'DEV_FOCUS_HOURS_DAILY' },
        update: {},
        create: {
            code: 'DEV_FOCUS_HOURS_DAILY',
            name: 'Focus hours',
            description: 'Hours of deep work without interruptions (from Yaware)',
            unit: 'hours',
            direction: 'HIGHER_BETTER',
            frequency: 'DAILY',
            roleArchetypeId: backendDev.id,
        },
    });

    await prisma.kPITemplate.upsert({
        where: { code: 'DEV_STORY_POINTS_WEEKLY' },
        update: {},
        create: {
            code: 'DEV_STORY_POINTS_WEEKLY',
            name: 'Story points completed',
            description: 'Number of story points delivered',
            unit: 'points',
            direction: 'HIGHER_BETTER',
            frequency: 'WEEKLY',
            roleArchetypeId: backendDev.id,
        },
    });

    await prisma.kPITemplate.upsert({
        where: { code: 'DEV_CODE_REVIEWS_WEEKLY' },
        update: {},
        create: {
            code: 'DEV_CODE_REVIEWS_WEEKLY',
            name: 'Code reviews',
            description: 'Number of code reviews completed',
            unit: 'reviews',
            direction: 'HIGHER_BETTER',
            frequency: 'WEEKLY',
            roleArchetypeId: backendDev.id,
        },
    });

    console.log('✅ Backend Dev KPI Templates created');

    // 6. Create KPI Templates for CSM
    await prisma.kPITemplate.upsert({
        where: { code: 'CSM_NPS_MONTHLY' },
        update: {},
        create: {
            code: 'CSM_NPS_MONTHLY',
            name: 'NPS Score',
            description: 'Net Promoter Score from customers',
            unit: 'score',
            direction: 'HIGHER_BETTER',
            frequency: 'MONTHLY',
            roleArchetypeId: csm.id,
        },
    });

    await prisma.kPITemplate.upsert({
        where: { code: 'CSM_RENEWALS_MONTHLY' },
        update: {},
        create: {
            code: 'CSM_RENEWALS_MONTHLY',
            name: 'Contract renewals',
            description: 'Number of contracts renewed',
            unit: 'renewals',
            direction: 'HIGHER_BETTER',
            frequency: 'MONTHLY',
            roleArchetypeId: csm.id,
        },
    });

    await prisma.kPITemplate.upsert({
        where: { code: 'CSM_TICKETS_DAILY' },
        update: {},
        create: {
            code: 'CSM_TICKETS_DAILY',
            name: 'Support tickets resolved',
            description: 'Number of customer support tickets closed',
            unit: 'tickets',
            direction: 'HIGHER_BETTER',
            frequency: 'DAILY',
            roleArchetypeId: csm.id,
        },
    });

    console.log('✅ CSM KPI Templates created');

    console.log('🎉 Archetype seeding complete!');
}

seedArchetypes()
    .catch((e) => {
        console.error('❌ Error seeding archetypes:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
