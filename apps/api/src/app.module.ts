import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DailyReportsModule } from './daily-reports/daily-reports.module';
import { ProjectsModule } from './projects/projects.module';
import { TagsModule } from './tags/tags.module';
import { CalendarModule } from './integrations/calendar/calendar.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { UserAdminModule } from './user-admin/user-admin.module';
import { RoleArchetypesModule } from './role-archetypes/role-archetypes.module';
import { ManagerDashboardModule } from './manager-dashboard/manager-dashboard.module';
import { HealthModule } from './health/health.module';
import { OrganizationModule } from './organization/organization.module';
import { SeederModule } from './seeder/seeder.module';
import { CommonModule } from './common/common.module';
import { YawareModule } from './integrations/yaware/yaware.module';
import { DepartmentsModule } from './departments/departments.module';
import { MyDayModule } from './my-day/my-day.module';
import { ThreeBlocksModule } from './three-blocks/three-blocks.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    DailyReportsModule,
    ProjectsModule,
    TagsModule,
    CalendarModule,
    UserSettingsModule,
    UserAdminModule,
    RoleArchetypesModule,
    ManagerDashboardModule,
    HealthModule,
    OrganizationModule,
    SeederModule,
    YawareModule,
    DepartmentsModule,
    MyDayModule,
    ThreeBlocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
