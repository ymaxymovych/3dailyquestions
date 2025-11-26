import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YawareService } from './yaware.service';

@Module({
    imports: [HttpModule],
    providers: [YawareService],
    exports: [YawareService],
})
export class YawareModule { }
