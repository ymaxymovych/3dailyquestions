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
}
