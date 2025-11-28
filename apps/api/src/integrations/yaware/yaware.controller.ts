import { Controller, Get, Query } from '@nestjs/common';
import { YawareService } from './yaware.service';

@Controller('integrations/yaware')
export class YawareController {
    constructor(private readonly yawareService: YawareService) { }

    /**
     * Test endpoint to verify Yaware API integration (PUBLIC for testing)
     * GET /integrations/yaware/test?employeeId=7646771
     */
    @Get('test')
    async testYawareIntegration(@Query('employeeId') employeeId: string) {
        if (!employeeId) {
            return {
                success: false,
                message: 'employeeId query parameter is required',
                example: '/integrations/yaware/test?employeeId=7646771',
            };
        }

        const today = new Date();

        try {
            const data = await this.yawareService.getEmployeeProductivity(employeeId, today);

            return {
                success: true,
                message: 'Yaware API integration working',
                data,
                employeeId,
                date: today.toISOString().split('T')[0],
            };
        } catch (error) {
            return {
                success: false,
                message: 'Yaware API integration failed',
                error: error.message,
                employeeId,
            };
        }
    }
}
