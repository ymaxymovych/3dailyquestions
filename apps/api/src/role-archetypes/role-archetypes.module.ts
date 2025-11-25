import { Module } from '@nestjs/common';
import { RoleArchetypesController } from './role-archetypes.controller';
import { RoleArchetypesService } from './role-archetypes.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RoleArchetypesController],
    providers: [RoleArchetypesService],
    exports: [RoleArchetypesService],
})
export class RoleArchetypesModule { }
