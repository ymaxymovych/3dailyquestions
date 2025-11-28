import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyReportsService } from './daily-reports.service';
import { CreateDailyReportDto } from './dto/create-daily-report.dto';
import { UpdateDailyReportDto } from './dto/update-daily-report.dto';

import { TenantGuard } from '../common/guards/tenant.guard';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('daily-reports')
export class DailyReportsController {
  constructor(private readonly dailyReportsService: DailyReportsService) { }

  @Post()
  create(@Request() req: any, @Body() dto: CreateDailyReportDto) {
    return this.dailyReportsService.create(req.user.userId, req.organizationId, dto);
  }

  @Get()
  findAll(@Request() req: any, @Query('date') date?: string) {
    if (date) {
      return this.dailyReportsService.findByDate(req.user.userId, date);
    }
    return this.dailyReportsService.findAll(req.user.userId, req.organizationId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.dailyReportsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateDailyReportDto) {
    return this.dailyReportsService.update(req.user.userId, id, dto);
  }

  @Patch(':id/publish')
  publish(@Request() req: any, @Param('id') id: string) {
    return this.dailyReportsService.publish(req.user.userId, id);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.dailyReportsService.delete(req.user.userId, id);
  }
}
