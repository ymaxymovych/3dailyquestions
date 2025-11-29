import { Module } from '@nestjs/common';
import { MyDayController } from './my-day.controller';
import { MyDayService } from './my-day.service';
import { TextParserService } from './services/text-parser.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MyDayController],
    providers: [MyDayService, TextParserService],
    exports: [MyDayService],
})
export class MyDayModule { }
