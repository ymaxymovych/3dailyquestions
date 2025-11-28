import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { subDays } from 'date-fns';

@Injectable()
export class DemoSeederService {
    private readonly logger = new Logger(DemoSeederService.name);

    constructor(private prisma: PrismaService) { }

    async seedDemoOrg(userId: string) {
        this.logger.log(`Seeding demo organization for user ${userId}`);

        // 1. Create Demo Organization
        const orgName = `Demo Company ${Math.floor(Math.random() * 1000)}`;

        const org = await this.prisma.organization.create({
            data: {
                name: orgName,
                plan: 'demo',
                status: 'active',
            },
        });

        // 2. Create Departments
        const engDept = await this.prisma.department.create({
            data: {
                name: 'Engineering',
                orgId: org.id,
                managerId: userId,
            },
        });

        const salesDept = await this.prisma.department.create({
            data: {
                name: 'Sales',
                orgId: org.id,
            },
        });

        // 3. Update User to be in this Org & Dept
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                orgId: org.id,
                deptId: engDept.id,
            },
        });

        // 4. Create Fake Employees (simplified - no roleArchetype for demo)
        const employeeCount = 9;
        const employees = [];

        for (let i = 0; i < employeeCount; i++) {
            const sex = Math.random() > 0.5 ? 'male' : 'female';
            const firstName = faker.person.firstName(sex);
            const lastName = faker.person.lastName(sex);
            const email = faker.internet.email({ firstName, lastName, provider: 'demo.com' });
            const deptId = i < 5 ? engDept.id : salesDept.id;

            const employee = await this.prisma.user.create({
                data: {
                    email,
                    fullName: `${firstName} ${lastName}`,
                    orgId: org.id,
                    deptId: deptId,
                },
            });
            employees.push(employee);
        }

        // 5. Generate Reports for last 7 days
        const allUsers = [userId, ...employees.map(e => e.id)];

        for (const uid of allUsers) {
            for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                const reportDate = subDays(new Date(), dayOffset);

                await this.prisma.dailyReport.create({
                    data: {
                        userId: uid,
                        orgId: org.id,
                        date: reportDate,
                        yesterdayBig: { task: faker.lorem.sentence() },
                        yesterdayMedium: { task: faker.lorem.sentence() },
                        yesterdaySmall: { task: faker.lorem.sentence() },
                        todayBig: { task: faker.lorem.sentence() },
                        todayMedium: { task: faker.lorem.sentence() },
                        todaySmall: { task: faker.lorem.sentence() },
                        mood: Math.floor(Math.random() * 5) + 1,
                        status: 'PUBLISHED',
                        publishedAt: reportDate,
                    },
                });
            }
        }

        this.logger.log(`Demo organization created: ${org.name} (${org.id})`);
        return org;
    }
}
