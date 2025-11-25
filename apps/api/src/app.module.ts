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

import { ConfigModule } from '@nestjs/config';

import { UserAdminModule } from './user-admin/user-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DailyReportsModule,
    ProjectsModule,
    TagsModule,
    CalendarModule,
    UserSettingsModule,
    UserAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
