import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { AccessLogController } from './access-log.controller';
import { AccessLogService } from './access-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProfileController, RoleController, KpiController, AccessLogController],
    providers: [ProfileService, RoleService, KpiService, AccessLogService],
    exports: [ProfileService, RoleService, KpiService, AccessLogService],
})
export class UserAdminModule { }
