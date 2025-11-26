import { Module } from '@nestjs/common';
import { ManagerDashboardController } from './manager-dashboard.controller';
import { ManagerDashboardService } from './manager-dashboard.service';
import { AiFlagsService } from './ai-flags.service';
import { IntegrationsSnapshotService } from './integrations-snapshot.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ManagerDashboardController],
    providers: [ManagerDashboardService, AiFlagsService, IntegrationsSnapshotService],
    exports: [ManagerDashboardService],
})
export class ManagerDashboardModule { }
