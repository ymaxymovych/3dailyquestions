import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SeederModule } from '../seeder/seeder.module';

@Module({
    imports: [PrismaModule, SeederModule],
    controllers: [OrganizationController],
    providers: [OrganizationService],
    exports: [OrganizationService],
})
export class OrganizationModule { }
