import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('integrations/calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @Get('events')
    async getEvents(@Request() req: any, @Query('date') date: string) {
        return this.calendarService.getEvents(req.user.userId, date);
    }
}
