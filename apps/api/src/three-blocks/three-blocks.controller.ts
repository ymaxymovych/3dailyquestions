```typescript
import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThreeBlocksService } from './three-blocks.service';

@Controller('3-blocks')
@UseGuards(JwtAuthGuard)
export class ThreeBlocksController {
    constructor(private readonly threeBlocksService: ThreeBlocksService) { }

    @Get(':date')
    async getThreeBlocks(@Request() req: any, @Param('date') dateString: string) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Invalid date format');
        }
        return this.threeBlocksService.getThreeBlocks(req.user.userId, date);
    }

    @Put(':date')
    async updateThreeBlocks(
        @Request() req: any,
        @Param('date') dateString: string,
        @Body()
        body: {
            yesterdayTasks?: string;
            yesterdayMetrics?: string;
            todayPlan?: string;
            helpNeeded?: string;
        },
    ) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Invalid date format');
        }
        return this.threeBlocksService.updateThreeBlocks(
            req.user.userId,
            date,
            body,
        );
    }

    @Post(':date/publish')
    async publishThreeBlocks(@Request() req: any, @Param('date') dateString: string) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Invalid date format');
        }
        return this.threeBlocksService.publishThreeBlocks(req.user.userId, date);
    }
}
```
