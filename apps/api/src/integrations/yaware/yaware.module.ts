import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YawareService } from './yaware.service';
import { YawareController } from './yaware.controller';

@Module({
    imports: [HttpModule],
    controllers: [YawareController],
    providers: [YawareService],
    exports: [YawareService],
})
export class YawareModule { }
