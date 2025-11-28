import { Module } from '@nestjs/common';
import { DemoSeederService } from './demo-seeder.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [DemoSeederService],
    exports: [DemoSeederService],
})
export class SeederModule { }
