import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiFlagsService } from './ai-flags.service';
import { IntegrationsSnapshotService } from './integrations-snapshot.service';

@Injectable()
export class ManagerDashboardService {
    constructor(
        private prisma: PrismaService,
        private aiFlagsService: AiFlagsService,
        private integrationsSnapshotService: IntegrationsSnapshotService
    ) { }

    /**
     * Get team reports for a specific date
     */
    async getTeamReports(managerId: string, organizationId: string, date: string, filters?: {
        status?: 'submitted' | 'not_submitted' | 'all';
        hasHelpRequest?: boolean;
        hasBigTask?: boolean;
    }) {
        // Find departments where user is manager AND in the same organization
        const departments = await this.prisma.department.findMany({
            where: {
                managerId,
                orgId: organizationId
            },
            include: {
                users: {
                    include: {
                        roleArchetype: {
                            include: {
                                departmentArchetype: true,
                            },
                        },
                    },
                },
            },
        });

        const teamUserIds = departments.flatMap(dept => dept.users.map(u => u.id));

        // Get reports for team members on specified date
        const reports = await this.prisma.dailyReport.findMany({
            where: {
                userId: { in: teamUserIds },
                orgId: organizationId, // Ensure reports belong to the same org
                date: new Date(date),
            },
            include: {
                user: {
                    include: {
                        roleArchetype: true,
                    },
                },
                helpRequests: true,
                kpis: true,
            },
        });

        // Create map of user reports
        const reportMap = new Map(reports.map(r => [r.userId, r]));

        // Build response with all team members (including those without reports)
        const teamReports = await Promise.all(
            departments.flatMap(dept =>
                dept.users.map(async (user) => {
                    const report = reportMap.get(user.id) as any; // Cast to any to handle relations
                    const hasBigTask = report?.todayBig && Array.isArray(report.todayBig) && report.todayBig.length > 0;
                    const hasHelpRequest = report?.helpRequests && report.helpRequests.length > 0;
                    const status = report ? 'submitted' : 'not_submitted';

                    // Get recent reports for AI flags calculation
                    const recentReports = await this.getEmployeeHistory(managerId, user.id, 7);

                    // Get integrations snapshot (Calendar + Yaware)
                    const integrationsSnapshot = await this.integrationsSnapshotService.getSnapshot(
                        user.id,
                        new Date(date)
                    );

                    // Calculate AI flags
                    const aiFlags = this.aiFlagsService.calculateFlags(
                        report,
                        recentReports,
                        status as any,
                        integrationsSnapshot
                    );

                    return {
                        userId: user.id,
                        userName: user.fullName,
                        email: user.email,
                        position: user.roleArchetype?.name || 'N/A',
                        department: dept.name,
                        status,
                        submittedAt: report?.createdAt,
                        hasBigTask,
                        hasHelpRequest,
                        helpRequestsCount: report?.helpRequests?.length || 0,
                        aiFlags,
                        integrationsSnapshot,
                        report: report ? {
                            id: report.id,
                            yesterdayBig: report.yesterdayBig,
                            yesterdayMedium: report.yesterdayMedium,
                            yesterdaySmall: report.yesterdaySmall,
                            yesterdayNote: report.yesterdayNote,
                            todayBig: report.todayBig,
                            todayMedium: report.todayMedium,
                            todaySmall: report.todaySmall,
                            todayNote: report.todayNote,
                            mood: report.mood,
                            wellbeing: report.wellbeing,
                            helpRequests: report.helpRequests,
                            kpis: report.kpis,
                        } : null,
                    };
                })
            )
        );

        // Apply filters
        let filteredReports = teamReports;

        if (filters?.status && filters.status !== 'all') {
            filteredReports = filteredReports.filter(r => r.status === filters.status);
        }

        if (filters?.hasHelpRequest !== undefined) {
            filteredReports = filteredReports.filter(r => r.hasHelpRequest === filters.hasHelpRequest);
        }

        if (filters?.hasBigTask !== undefined) {
            filteredReports = filteredReports.filter(r => r.hasBigTask === filters.hasBigTask);
        }

        return filteredReports;
    }

    /**
     * Get team summary statistics
     */
    async getTeamSummary(managerId: string, organizationId: string, date: string) {
        const teamReports = await this.getTeamReports(managerId, organizationId, date);

        const totalMembers = teamReports.length;
        const submitted = teamReports.filter(r => r.status === 'submitted').length;
        const withBigTask = teamReports.filter(r => r.hasBigTask).length;
        const withHelpRequest = teamReports.filter(r => r.hasHelpRequest).length;
        const highRisk = teamReports.filter(r => r.aiFlags?.riskLevel === 'high').length;
        const needsAttention = teamReports.filter(r =>
            r.aiFlags?.riskLevel === 'high' || r.aiFlags?.riskLevel === 'medium'
        ).length;

        return {
            totalMembers,
            submitted,
            notSubmitted: totalMembers - submitted,
            completionRate: totalMembers > 0 ? Math.round((submitted / totalMembers) * 100) : 0,
            withBigTask,
            withHelpRequest,
            highRisk,
            needsAttention,
        };
    }

    /**
     * Get employee report history
     */
    async getEmployeeHistory(managerId: string, userId: string, days: number = 7) {
        // Verify manager has access to this employee
        const departments = await this.prisma.department.findMany({
            where: { managerId },
            include: { users: { where: { id: userId } } },
        });

        const hasAccess = departments.some(dept => dept.users.length > 0);
        if (!hasAccess) {
            throw new Error('Access denied: Employee not in your team');
        }

        // Get reports for last N days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const reports = await this.prisma.dailyReport.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                helpRequests: true,
                kpis: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return reports;
    }
}
