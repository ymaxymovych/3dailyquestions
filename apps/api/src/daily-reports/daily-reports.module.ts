import { Module } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { DailyReportsController } from './daily-reports.controller';
import { UserAdminModule } from '../user-admin/user-admin.module';

@Module({
  imports: [UserAdminModule],
  controllers: [DailyReportsController],
  providers: [DailyReportsService],
})
export class DailyReportsModule { }
