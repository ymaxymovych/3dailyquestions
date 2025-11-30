import { Module } from '@nestjs/common';
import { ThreeBlocksController } from './three-blocks.controller';
import { ThreeBlocksService } from './three-blocks.service';

@Module({
    controllers: [ThreeBlocksController],
    providers: [ThreeBlocksService],
})
export class ThreeBlocksModule { }
