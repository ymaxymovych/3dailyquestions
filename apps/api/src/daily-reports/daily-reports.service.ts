import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyReportDto } from './dto/create-daily-report.dto';
import { UpdateDailyReportDto } from './dto/update-daily-report.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class DailyReportsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) { }

  /**
   * Calculate load status based on tasks planned
   * Algorithm:
   * - Big task: 3 hours
   * - Medium task: 0.7 hours each
   * - Small task: 0.15 hours each
   * - Available hours: 8 - meetings - buffer (assume 6 hours available)
   * - Overloaded if load > available * 1.2
   * - Underloaded if load < available * 0.8
   * - Balanced otherwise
   */
  private calculateLoadStatus(todayBig: any, todayMedium: any, todaySmall: any): 'BALANCED' | 'OVERLOADED' | 'UNDERLOADED' {
    let loadHours = 0;

    // Big task: 3 hours
    if (todayBig) {
      loadHours += 3;
    }

    // Medium tasks: 0.7 hours each
    if (todayMedium) {
      const mediumCount = Array.isArray(todayMedium) ? todayMedium.length : 1;
      loadHours += mediumCount * 0.7;
    }

    // Small tasks: 0.15 hours each
    if (todaySmall) {
      const smallCount = Array.isArray(todaySmall) ? todaySmall.length : 1;
      loadHours += smallCount * 0.15;
    }

    // Available hours (assuming 6 hours of productive time after meetings/buffer)
    const availableHours = 6;

    if (loadHours > availableHours * 1.2) {
      return 'OVERLOADED';
    } else if (loadHours < availableHours * 0.8) {
      return 'UNDERLOADED';
    } else {
      return 'BALANCED';
    }
  }

  async create(userId: string, organizationId: string, dto: CreateDailyReportDto) {
    // Check if report already exists for today
    const existingReport = await this.prisma.dailyReport.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(dto.date),
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('Report for this date already exists');
    }

    // Get user to check org
    const user = await this.usersService.findOne(userId);
    // Verify user belongs to organization
    if (user?.orgId !== organizationId) {
      throw new ForbiddenException('User does not belong to this organization');
    }

    const managerId = user?.department?.managerId || userId; // Fallback to self

    // Auto-calculate load status if not manually set
    const loadStatus = dto.loadStatus || this.calculateLoadStatus(dto.todayBig, dto.todayMedium, dto.todaySmall);

    // Create report
    return this.prisma.dailyReport.create({
      data: {
        userId,
        orgId: organizationId,
        date: new Date(dto.date),
        yesterdayBig: dto.yesterdayBig as any,
        yesterdayMedium: dto.yesterdayMedium as any,
        yesterdaySmall: dto.yesterdaySmall as any,
        yesterdayNote: dto.yesterdayNote,
        todayBig: dto.todayBig as any,
        todayMedium: dto.todayMedium as any,
        todaySmall: dto.todaySmall as any,
        todayNote: dto.todayNote,
        mood: dto.mood,
        wellbeing: dto.wellbeing,
        moodComment: dto.moodComment,
        status: dto.status || 'DRAFT',
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
        loadStatus: loadStatus,
        loadManuallySet: !!dto.loadStatus, // Track if it was manually set
        visibility: dto.visibility || 'TEAM',
        helpRequests: {
          create: dto.helpRequests?.map((hr) => ({
            text: hr.text,
            link: hr.link,
            assigneeId: hr.assigneeId || managerId,
            dueDate: hr.dueDate ? new Date(hr.dueDate) : new Date(),
            priority: hr.priority || 'MEDIUM',
          })),
        },
        kpis: {
          create: dto.kpis?.map((kpi) => ({
            kpiCode: kpi.kpiCode,
            value: kpi.value,
            goal: kpi.goal,
            comment: kpi.comment,
          })),
        },
      },
    });
  }

  async findAll(userId: string, organizationId: string) {
    return this.prisma.dailyReport.findMany({
      where: {
        userId,
        orgId: organizationId
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        helpRequests: true,
        kpis: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        helpRequests: { include: { assignee: true } },
        kpis: true
      },
    });

    if (!report || report.userId !== userId) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async findByDate(userId: string, date: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { userId_date: { userId, date: new Date(date) } },
      include: {
        helpRequests: { include: { assignee: true } },
        kpis: true
      },
    });

    // If report doesn't exist, we can return a "virtual" draft with defaults
    if (!report) {
      // Fetch defaults
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roleArchetype: {
            include: { kpis: true }
          }
        }
      });

      // Pre-fill KPIs from Role Archetype
      const defaultKpis = user?.roleArchetype?.kpis.map(k => ({
        kpiCode: k.code,
        value: 0,
        goal: null,
        comment: null
      })) || [];

      // Legacy KPI support removed
      let defaultTodayNote = '';

      return {
        userId,
        date: new Date(date),
        status: 'DRAFT',
        todayNote: defaultTodayNote,
        kpis: defaultKpis,
        // ... other defaults
      };
    }

    return report;
  }

  async update(userId: string, id: string, dto: UpdateDailyReportDto) {
    const existing = await this.findOne(userId, id);

    // Delete existing help requests and create new ones
    if (dto.helpRequests) {
      await this.prisma.helpRequest.deleteMany({
        where: { reportId: id },
      });
    }

    // Delete existing KPIs and create new ones
    if (dto.kpis) {
      await this.prisma.dailyReportKPI.deleteMany({
        where: { reportId: id },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });
    const managerId = user?.department?.managerId || userId;

    // Recalculate load status if tasks changed and it wasn't manually set
    let loadStatus = existing.loadStatus;
    let loadManuallySet = existing.loadManuallySet;

    const tasksChanged = dto.todayBig !== undefined || dto.todayMedium !== undefined || dto.todaySmall !== undefined;

    if (tasksChanged && !existing.loadManuallySet) {
      // Use new values if provided, otherwise keep existing
      const newTodayBig = dto.todayBig !== undefined ? dto.todayBig : existing.todayBig;
      const newTodayMedium = dto.todayMedium !== undefined ? dto.todayMedium : existing.todayMedium;
      const newTodaySmall = dto.todaySmall !== undefined ? dto.todaySmall : existing.todaySmall;

      loadStatus = this.calculateLoadStatus(newTodayBig, newTodayMedium, newTodaySmall);
    }

    // If loadStatus is explicitly provided in DTO, use it and mark as manual
    if (dto.loadStatus) {
      loadStatus = dto.loadStatus;
      loadManuallySet = true;
    }

    return this.prisma.dailyReport.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.yesterdayBig !== undefined && { yesterdayBig: dto.yesterdayBig as any }),
        ...(dto.yesterdayMedium !== undefined && { yesterdayMedium: dto.yesterdayMedium as any }),
        ...(dto.yesterdaySmall !== undefined && { yesterdaySmall: dto.yesterdaySmall as any }),
        ...(dto.yesterdayNote !== undefined && { yesterdayNote: dto.yesterdayNote }),
        ...(dto.todayBig !== undefined && { todayBig: dto.todayBig as any }),
        ...(dto.todayMedium !== undefined && { todayMedium: dto.todayMedium as any }),
        ...(dto.todaySmall !== undefined && { todaySmall: dto.todaySmall as any }),
        ...(dto.todayNote !== undefined && { todayNote: dto.todayNote }),
        ...(dto.mood !== undefined && { mood: dto.mood }),
        ...(dto.wellbeing !== undefined && { wellbeing: dto.wellbeing }),
        ...(dto.moodComment !== undefined && { moodComment: dto.moodComment }),
        loadStatus,
        loadManuallySet,
        ...(dto.helpRequests && {
          helpRequests: {
            create: dto.helpRequests.map((hr) => ({
              text: hr.text,
              link: hr.link,
              assigneeId: hr.assigneeId || managerId,
              dueDate: hr.dueDate ? new Date(hr.dueDate) : new Date(Date.now() + 86400000),
              priority: hr.priority || 'MEDIUM',
            })),
          },
        }),
        ...(dto.kpis && {
          kpis: {
            create: dto.kpis.map((k) => ({
              kpiCode: k.kpiCode,
              value: k.value,
              goal: k.goal,
              comment: k.comment,
            })),
          },
        }),
      },
      include: { helpRequests: true, kpis: true },
    });
  }

  async publish(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    return this.prisma.dailyReport.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.dailyReport.delete({
      where: { id },
    });
  }

  // ==================== TEAM VIEW METHODS ====================

  async findAllByTeam(userId: string, organizationId: string, date?: string) {
    // Get user's department
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deptId: true },
    });

    if (!user?.deptId) {
      throw new ForbiddenException('You must be assigned to a department to view team reports');
    }

    const whereClause: any = {
      orgId: organizationId,
      user: {
        deptId: user.deptId,
      },
      visibility: {
        in: ['PUBLIC', 'TEAM'],
      },
    };

    const threeBlocksWhereClause: any = {
      user: {
        deptId: user.deptId,
        orgId: organizationId, // Ensure user belongs to org
      },
      status: 'PUBLISHED', // Only show published reports
    };

    if (date) {
      const targetDate = new Date(date);
      whereClause.date = targetDate;
      threeBlocksWhereClause.date = targetDate;
    }

    // Fetch both DailyReports and ThreeBlocks in parallel
    const [dailyReports, threeBlocks] = await Promise.all([
      this.prisma.dailyReport.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              roleArchetype: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
          helpRequests: true,
          kpis: true,
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.threeBlocks.findMany({
        where: threeBlocksWhereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              roleArchetype: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Map ThreeBlocks to DailyReport structure
    const mappedThreeBlocks = threeBlocks.map(block => {
      let todayPlan: any = {};
      let helpNeeded: any = {};
      let yesterdayTasks: any = {};

      try {
        todayPlan = block.todayPlan ? JSON.parse(block.todayPlan) : {};
        helpNeeded = block.helpNeeded ? JSON.parse(block.helpNeeded) : {};
        yesterdayTasks = block.yesterdayTasks ? JSON.parse(block.yesterdayTasks) : {};
      } catch (e) {
        console.error('Error parsing ThreeBlocks JSON', e);
      }

      // Extract tasks
      const bigTask = todayPlan.bigTask ? { text: todayPlan.bigTask } : null;

      // Medium tasks are stored as a single string with newlines in the new UI
      const mediumTasks = todayPlan.mediumTasks
        ? todayPlan.mediumTasks.split('\n').filter((t: string) => t.trim()).map((t: string) => ({ text: t }))
        : [];

      const smallTasks = todayPlan.smallTasks
        ? todayPlan.smallTasks.split('\n').filter((t: string) => t.trim()).map((t: string) => ({ text: t }))
        : [];

      // Blockers
      const helpRequests = helpNeeded.blockers
        ? helpNeeded.blockers.split('\n').filter((t: string) => t.trim()).map((t: string, index: number) => ({
          id: `virtual-hr-${block.id}-${index}`,
          text: t,
          priority: 'HIGH',
          status: 'OPEN',
        }))
        : [];

      // Calculate load status
      const loadStatus = this.calculateLoadStatus(bigTask, mediumTasks, smallTasks);

      return {
        id: block.id,
        userId: block.userId,
        date: block.date,
        todayBig: bigTask,
        todayMedium: mediumTasks,
        todaySmall: smallTasks,
        yesterdayBig: null, // TODO: Extract from yesterdayTasks if needed
        loadStatus,
        loadManuallySet: false,
        visibility: 'TEAM',
        user: block.user,
        helpRequests,
        kpis: [], // TODO: Extract metrics if needed
        reactions: [],
        comments: [],
        createdAt: block.createdAt,
        updatedAt: block.updatedAt,
      };
    });

    // Merge lists, preferring ThreeBlocks if both exist for same user/date
    // Actually, if a user has both, we should probably show the most recently updated one, 
    // OR just prefer ThreeBlocks as it's the "v2".
    // Let's use a Map to deduplicate by userId

    const reportMap = new Map<string, any>();

    // Add DailyReports first
    dailyReports.forEach(report => {
      reportMap.set(report.userId, report);
    });

    // Add/Overwrite with ThreeBlocks
    mappedThreeBlocks.forEach(report => {
      reportMap.set(report.userId, report);
    });

    return Array.from(reportMap.values());
  }

  async addReaction(userId: string, reportId: string, emoji: string) {
    // Check if report exists and is visible
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
            deptId: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check if user can see this report (same department or public)
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deptId: true },
    });

    if (report.visibility === 'PRIVATE' && report.userId !== userId) {
      throw new ForbiddenException('Cannot react to private reports');
    }

    if (report.visibility === 'TEAM' && currentUser?.deptId !== report.user.deptId) {
      throw new ForbiddenException('Cannot react to reports outside your team');
    }

    // Toggle reaction (if exists, delete; if not, create)
    const existing = await this.prisma.dailyReportReaction.findUnique({
      where: {
        reportId_userId_emoji: {
          reportId,
          userId,
          emoji,
        },
      },
    });

    if (existing) {
      await this.prisma.dailyReportReaction.delete({
        where: { id: existing.id },
      });
      return { action: 'removed' };
    } else {
      await this.prisma.dailyReportReaction.create({
        data: {
          reportId,
          userId,
          emoji,
        },
      });
      return { action: 'added' };
    }
  }

  async addComment(userId: string, reportId: string, text: string) {
    // Check if report exists and is visible
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
            deptId: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check visibility
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deptId: true },
    });

    if (report.visibility === 'PRIVATE' && report.userId !== userId) {
      throw new ForbiddenException('Cannot comment on private reports');
    }

    if (report.visibility === 'TEAM' && currentUser?.deptId !== report.user.deptId) {
      throw new ForbiddenException('Cannot comment on reports outside your team');
    }

    return this.prisma.dailyReportComment.create({
      data: {
        reportId,
        userId,
        text,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Manager actions
  async updateBigTask(managerId: string, reportId: string, newBigTask: any, comment: string) {
    // Verify manager has permission (check if they manage the user's department)
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.user.department?.managerId !== managerId) {
      throw new ForbiddenException('You are not the manager of this user');
    }

    return this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        todayBig: newBigTask,
      },
    });
  }

  async setLoadStatus(managerId: string, reportId: string, loadStatus: 'BALANCED' | 'OVERLOADED' | 'UNDERLOADED') {
    // Verify manager has permission
    const report = await this.prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: {
        user: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.user.department?.managerId !== managerId) {
      throw new ForbiddenException('You are not the manager of this user');
    }

    return this.prisma.dailyReport.update({
      where: { id: reportId },
      data: {
        loadStatus,
        loadManuallySet: true,
      },
    });
  }
}
