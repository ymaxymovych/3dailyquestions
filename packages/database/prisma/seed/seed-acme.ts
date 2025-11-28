import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orgName = 'Acme Corp';
    const domain = 'acme.com';

    // Check if exists
    const existing = await prisma.organization.findFirst({
        where: { domains: { has: domain } }
    });

    if (existing) {
        console.log(`Organization with domain ${domain} already exists: ${existing.name}`);
        return;
    }

    // Ensure Roles Exist
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'Administrator', isSystem: true }
    });

    const ownerRole = await prisma.role.upsert({
        where: { name: 'OWNER' },
        update: {},
        create: { name: 'OWNER', description: 'Organization Owner', isSystem: true }
    });

    // Create Org
    const org = await prisma.organization.create({
        data: {
            name: orgName,
            slug: 'acme-corp',
            domains: [domain],
            users: {
                create: {
                    email: `admin@${domain}`,
                    fullName: 'Acme Admin',
                    passwordHash: 'password123', // In real app this should be hashed
                    roles: {
                        create: [
                            { role: { connect: { id: adminRole.id } } },
                            { role: { connect: { id: ownerRole.id } } }
                        ]
                    }
                }
            }
        }
    });

    console.log(`Created organization: ${org.name} with domain ${domain}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
