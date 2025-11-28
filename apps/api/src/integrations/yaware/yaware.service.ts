import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { format } from 'date-fns';

export interface YawareProductivityData {
    employeeId: string;
    date: string;
    productiveTimeMinutes: number;
    neutralTimeMinutes: number;
    unproductiveTimeMinutes: number;
    focusTimeMinutes: number;
    applications?: Array<{
        name: string;
        timeMinutes: number;
        category: 'productive' | 'neutral' | 'unproductive';
    }>;
}

@Injectable()
export class YawareService {
    private readonly logger = new Logger(YawareService.name);
    private readonly yawareAccessKey: string;
    private readonly baseUrl = 'https://data1.yaware.com/export/account/json/v2';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.yawareAccessKey = this.configService.get('YAWARE_ACCESS_KEY') || '';
    }

    /**
     * Get employee productivity data for a specific date
     * Falls back to mock data if API is not configured or fails
     */
    async getEmployeeProductivity(
        yawareUserId: string,
        date: Date,
    ): Promise<YawareProductivityData> {
        // Check if API is configured
        if (!this.yawareAccessKey) {
            this.logger.warn('Yaware API not configured, using mock data');
            return this.getMockProductivityData(yawareUserId, date);
        }

        try {
            const dateStr = format(date, 'yyyy-MM-dd');

            // Call direct Yaware API
            const url = `${this.baseUrl}/getBeginEndMonitoringByEmployees`;
            const params = {
                access_key: this.yawareAccessKey,
                employees: yawareUserId,
                date_from: dateStr,
                date_to: dateStr,
            };

            this.logger.log(`Fetching Yaware data for employee ${yawareUserId} on ${dateStr}`);

            const response = await firstValueFrom(
                this.httpService.get(url, { params })
            );

            // Parse response and transform to our format
            return this.transformYawareResponse(response.data, yawareUserId, dateStr);
        } catch (error) {
            this.logger.error(`Failed to fetch Yaware data: ${error.message}`, error.stack);
            this.logger.warn('Falling back to mock data');
            return this.getMockProductivityData(yawareUserId, date);
        }
    }

    /**
     * Transform Yaware API response to our internal format
     */
    private transformYawareResponse(data: any, employeeId: string, date: string): YawareProductivityData {
        // TODO: Parse actual Yaware response structure
        // For now, return mock data structure
        this.logger.log('Yaware API response received, transforming data');

        // Example transformation (adjust based on actual API response)
        const employeeData = data?.employees?.[0] || {};

        return {
            employeeId,
            date,
            productiveTimeMinutes: employeeData.productive_time || 0,
            neutralTimeMinutes: employeeData.neutral_time || 0,
            unproductiveTimeMinutes: employeeData.unproductive_time || 0,
            focusTimeMinutes: employeeData.focus_time || 0,
            applications: employeeData.applications || [],
        };
    }

    /**
     * Get work time statistics for multiple employees
     */
    async getWorkTimeStats(
        yawareUserIds: string[],
        dateFrom: Date,
        dateTo: Date,
    ): Promise<Map<string, YawareProductivityData[]>> {
        if (!this.yawareAccessKey) {
            this.logger.warn('Yaware API not configured, using mock data');
            return this.getMockWorkTimeStats(yawareUserIds, dateFrom, dateTo);
        }

        try {
            const url = `${this.baseUrl}/getBeginEndMonitoringByEmployees`;
            const params = {
                access_key: this.yawareAccessKey,
                employees: yawareUserIds.join(','),
                date_from: format(dateFrom, 'yyyy-MM-dd'),
                date_to: format(dateTo, 'yyyy-MM-dd'),
            };

            this.logger.log(`Fetching Yaware stats for ${yawareUserIds.length} employees`);

            const response = await firstValueFrom(
                this.httpService.get(url, { params })
            );

            return this.transformWorkTimeStatsResponse(response.data);
        } catch (error) {
            this.logger.error(`Failed to fetch Yaware stats: ${error.message}`);
            return this.getMockWorkTimeStats(yawareUserIds, dateFrom, dateTo);
        }
    }

    private transformWorkTimeStatsResponse(data: any): Map<string, YawareProductivityData[]> {
        const result = new Map<string, YawareProductivityData[]>();

        // TODO: Parse actual response structure
        // For now, return empty map
        this.logger.log('Transforming work time stats response');

        return result;
    }

    /**
     * Generate mock productivity data for testing
     */
    private getMockProductivityData(employeeId: string, date: Date): YawareProductivityData {
        const baseMinutes = 480; // 8 hours
        const variance = Math.random() * 0.3 - 0.15; // ±15%

        const productiveTime = Math.floor(baseMinutes * (0.6 + variance));
        const neutralTime = Math.floor(baseMinutes * (0.25 + variance * 0.5));
        const unproductiveTime = Math.floor(baseMinutes * (0.15 + variance * 0.3));
        const focusTime = Math.floor(productiveTime * 0.7);

        return {
            employeeId,
            date: format(date, 'yyyy-MM-dd'),
            productiveTimeMinutes: productiveTime,
            neutralTimeMinutes: neutralTime,
            unproductiveTimeMinutes: unproductiveTime,
            focusTimeMinutes: focusTime,
            applications: [
                { name: 'VS Code', timeMinutes: Math.floor(productiveTime * 0.4), category: 'productive' },
                { name: 'Chrome', timeMinutes: Math.floor(productiveTime * 0.3), category: 'productive' },
                { name: 'Slack', timeMinutes: Math.floor(neutralTime * 0.6), category: 'neutral' },
                { name: 'YouTube', timeMinutes: Math.floor(unproductiveTime * 0.5), category: 'unproductive' },
            ],
        };
    }

    private getMockWorkTimeStats(
        yawareUserIds: string[],
        dateFrom: Date,
        dateTo: Date,
    ): Map<string, YawareProductivityData[]> {
        const result = new Map<string, YawareProductivityData[]>();

        yawareUserIds.forEach(userId => {
            const stats: YawareProductivityData[] = [];
            const currentDate = new Date(dateFrom);

            while (currentDate <= dateTo) {
                stats.push(this.getMockProductivityData(userId, new Date(currentDate)));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            result.set(userId, stats);
        });

        return result;
    }
}
