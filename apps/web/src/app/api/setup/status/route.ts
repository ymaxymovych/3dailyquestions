import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';


// GET /api/setup/status - Get organization setup status and feature flags
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        // Get or create setup record
        let setup = await prisma.organizationSetup.findUnique({
            where: { orgId },
        });

        if (!setup) {
            // Create initial setup record
            setup = await prisma.organizationSetup.create({
                data: { orgId },
            });
        }

        // Fetch actual data to compute real status
        const [org, departments, teams, jobRoles, users] = await Promise.all([
            prisma.organization.findUnique({
                where: { id: orgId },
                select: { settings: true, aiPolicy: true },
            }),
            prisma.department.count({ where: { orgId } }),
            prisma.team.count({ where: { orgId } }),
            prisma.jobRole.count({ where: { orgId } }),
            prisma.user.count({ where: { orgId } }),
        ]);

        // Compute actual completion statuses
        const companyConfigured = !!(org?.settings || org?.aiPolicy);
        const structureConfigured = departments > 0;
        const rolesConfigured = jobRoles > 0;
        const employeesConfigured = users >= 2;

        // Compute feature flags
        const aiMentorEnabled = companyConfigured && rolesConfigured && employeesConfigured;
        const managerDigestEnabled = structureConfigured && rolesConfigured;
        const taskStructurizerEnabled = true; // Always available

        // Update setup record if changed
        if (
            setup.companyConfigured !== companyConfigured ||
            setup.structureConfigured !== structureConfigured ||
            setup.rolesConfigured !== rolesConfigured ||
            setup.employeesConfigured !== employeesConfigured ||
            setup.aiMentorEnabled !== aiMentorEnabled ||
            setup.managerDigestEnabled !== managerDigestEnabled
        ) {
            setup = await prisma.organizationSetup.update({
                where: { orgId },
                data: {
                    companyConfigured,
                    structureConfigured,
                    rolesConfigured,
                    employeesConfigured,
                    aiMentorEnabled,
                    managerDigestEnabled,
                    taskStructurizerEnabled,
                },
            });
        }

        // Return status with counts
        return NextResponse.json({
            setup,
            counts: {
                departments,
                teams,
                jobRoles,
                users,
            },
            features: {
                aiMentor: {
                    enabled: aiMentorEnabled,
                    requirements: {
                        companyConfigured,
                        rolesConfigured,
                        employeesConfigured,
                    },
                },
                managerDigest: {
                    enabled: managerDigestEnabled,
                    requirements: {
                        structureConfigured,
                        rolesConfigured,
                    },
                },
                taskStructurizer: {
                    enabled: taskStructurizerEnabled,
                    requirements: {},
                },
            },
        });
    } catch (error) {
        console.error('Error fetching setup status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch setup status' },
            { status: 500 }
        );
    }
}

// POST /api/setup/status - Update wizard state
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { wizardCompleted, wizardSkipped, currentStep } = body;

        const setup = await prisma.organizationSetup.upsert({
            where: { orgId },
            create: {
                orgId,
                wizardCompleted: wizardCompleted || false,
                wizardSkipped: wizardSkipped || false,
                currentStep: currentStep || 1,
            },
            update: {
                ...(wizardCompleted !== undefined && { wizardCompleted }),
                ...(wizardSkipped !== undefined && { wizardSkipped }),
                ...(currentStep !== undefined && { currentStep }),
            },
        });

        return NextResponse.json(setup);
    } catch (error) {
        console.error('Error updating setup status:', error);
        return NextResponse.json(
            { error: 'Failed to update setup status' },
            { status: 500 }
        );
    }
}
