import { PrismaClient } from '@prisma/client';
// Get all reports without orgId
const reports = await prisma.dailyReport.findMany({
    where: { orgId: null },
    include: { user: true },
    take: 1000 // Process in batches
});

console.log(`Found ${reports.length} reports to update in this batch.`);

let updatedCount = 0;
for (const report of reports) {
    if (report.user && report.user.orgId) {
        await prisma.dailyReport.update({
            where: { id: report.id },
            data: { orgId: report.user.orgId }
        });
        updatedCount++;
    }
}

console.log(`✅ Updated ${updatedCount} reports.`);

// Check if more remain
const remaining = await prisma.dailyReport.count({ where: { orgId: null } });
if (remaining > 0) {
    console.log(`⚠️ ${remaining} reports still pending. Run script again to continue.`);
} else {
    console.log('✨ All daily reports linked to organizations.');
}
}

migrateToOrganizations()
    .catch((e) => {
        console.error('❌ Error during migration:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
