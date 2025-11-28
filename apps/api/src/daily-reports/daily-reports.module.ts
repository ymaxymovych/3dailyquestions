import { Module } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { DailyReportsController } from './daily-reports.controller';
import { UserAdminModule } from '../user-admin/user-admin.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UserAdminModule, UsersModule],
  controllers: [DailyReportsController],
  providers: [DailyReportsService],
})
export class DailyReportsModule { }
