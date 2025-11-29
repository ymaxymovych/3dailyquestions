import { Controller, Get, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MyDayService } from './my-day.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('my-day')
@UseGuards(JwtAuthGuard, TenantGuard)
export class MyDayController {
    constructor(private readonly myDayService: MyDayService) { }

    @Get(':date')
    async getPlan(@Req() req: any, @Param('date') date: string) {
        return this.myDayService.getOrCreatePlan(req.user.id, date);
    }

    @Put(':date')
    async updatePlan(@Req() req: any, @Param('date') date: string, @Body() dto: UpdatePlanDto) {
        return this.myDayService.updatePlanText(req.user.id, date, dto.text);
    }

    @Get(':date/load-status')
    async getLoadStatus(@Req() req: any, @Param('date') date: string) {
        const plan = await this.myDayService.getOrCreatePlan(req.user.id, date);
        return this.myDayService.calculateLoad(plan as any);
    }
}
