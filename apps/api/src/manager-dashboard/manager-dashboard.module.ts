import { Module } from '@nestjs/common';
import { ManagerDashboardController } from './manager-dashboard.controller';
import { ManagerDashboardService } from './manager-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiFlagsService } from './ai-flags.service';
import { IntegrationsSnapshotService } from './integrations-snapshot.service';
import { YawareModule } from '../integrations/yaware/yaware.module';

@Module({
    imports: [PrismaModule, YawareModule],
    controllers: [ManagerDashboardController],
    providers: [ManagerDashboardService, AiFlagsService, IntegrationsSnapshotService],
})
export class ManagerDashboardModule { }
