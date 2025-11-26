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
    private readonly rapidApiKey: string;
    private readonly rapidApiHost: string;
    private readonly yawareAccessKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.rapidApiKey = this.configService.get('RAPIDAPI_KEY') || '';
        this.rapidApiHost = this.configService.get('RAPIDAPI_HOST') || 'yaware-timetracker.p.rapidapi.com';
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
        if (!this.rapidApiKey || !this.yawareAccessKey) {
            this.logger.warn('Yaware API not configured, using mock data');
            return this.getMockProductivityData(yawareUserId, date);
        }

        try {
            const dateStr = format(date, 'yyyy-MM-dd');

            this.logger.debug(`Fetching Yaware data for user ${yawareUserId} on ${dateStr}`);

            // Call Yaware API via RapidAPI
            const response = await firstValueFrom(
                this.httpService.post(
                    `https://${this.rapidApiHost}/getEmployeeProductivity`,
                    {
                        access_key: this.yawareAccessKey,
                        employeeId: yawareUserId,
                        date: dateStr,
                    },
                    {
                        headers: {
                            'X-RapidAPI-Key': this.rapidApiKey,
                            'X-RapidAPI-Host': this.rapidApiHost,
                            'Content-Type': 'application/json',
                        },
                        timeout: 5000, // 5 second timeout
                    },
                ),
            );

            return this.parseProductivityData(response.data, yawareUserId, dateStr);
        } catch (error) {
            this.logger.error(
                `Failed to fetch Yaware data for user ${yawareUserId}: ${error.message}`,
            );

            // Fallback to mock data on error
            return this.getMockProductivityData(yawareUserId, date);
        }
    }

    /**
     * Parse Yaware API response to our format
     */
    private parseProductivityData(
        data: any,
        yawareUserId: string,
        dateStr: string,
    ): YawareProductivityData {
        // Yaware tracks productive, neutral, and unproductive time
        // Focus time = productive time (or can be calculated differently)

        return {
            employeeId: data.employeeId || data.userId || yawareUserId,
            date: data.date || dateStr,
            productiveTimeMinutes: data.productiveTime || data.productiveTimeMinutes || 0,
            neutralTimeMinutes: data.neutralTime || data.neutralTimeMinutes || 0,
            unproductiveTimeMinutes: data.unproductiveTime || data.unproductiveTimeMinutes || 0,
            focusTimeMinutes: data.focusTime || data.focusTimeMinutes || data.productiveTime || data.productiveTimeMinutes || 0,
            applications: data.applications || [],
        };
    }

    /**
     * Get employees by lateness (confirmed Yaware endpoint)
     */
    async getEmployeesByLateness(dateFrom: string, dateTo: string, limit = 100) {
        if (!this.rapidApiKey || !this.yawareAccessKey) {
            this.logger.warn('Yaware API not configured');
            return [];
        }

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `https://${this.rapidApiHost}/getEmployeesByLatenessByPeriod`,
                    {
                        access_key: this.yawareAccessKey,
                        dateFrom,
                        dateTo,
                        limit,
                    },
                    {
                        headers: {
                            'X-RapidAPI-Key': this.rapidApiKey,
                            'X-RapidAPI-Host': this.rapidApiHost,
                            'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                    },
                ),
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to fetch lateness data: ${error.message}`);
            return [];
        }
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        if (!this.rapidApiKey || !this.yawareAccessKey) {
            return {
                success: false,
                message: 'API credentials not configured',
            };
        }

        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            // Try to fetch lateness data as a connection test
            await firstValueFrom(
                this.httpService.post(
                    `https://${this.rapidApiHost}/getEmployeesByLatenessByPeriod`,
                    {
                        access_key: this.yawareAccessKey,
                        dateFrom: today,
                        dateTo: today,
                        limit: 1,
                    },
                    {
                        headers: {
                            'X-RapidAPI-Key': this.rapidApiKey,
                            'X-RapidAPI-Host': this.rapidApiHost,
                            'Content-Type': 'application/json',
                        },
                        timeout: 5000,
                    },
                ),
            );

            return {
                success: true,
                message: 'Successfully connected to Yaware API',
            };
        } catch (error) {
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
            };
        }
    }

    /**
     * Mock data generator for fallback
     */
    private getMockProductivityData(
        yawareUserId: string,
        date: Date,
    ): YawareProductivityData {
        const variant = this.getUserVariant(yawareUserId);
        const dateStr = format(date, 'yyyy-MM-dd');

        const mockDataVariants = [
            {
                productiveTimeMinutes: 480,
                neutralTimeMinutes: 60,
                unproductiveTimeMinutes: 30,
                focusTimeMinutes: 250,
            },
            {
                productiveTimeMinutes: 360,
                neutralTimeMinutes: 90,
                unproductiveTimeMinutes: 60,
                focusTimeMinutes: 90,
            },
            {
                productiveTimeMinutes: 300,
                neutralTimeMinutes: 120,
                unproductiveTimeMinutes: 90,
                focusTimeMinutes: 60,
            },
            {
                productiveTimeMinutes: 420,
                neutralTimeMinutes: 45,
                unproductiveTimeMinutes: 15,
                focusTimeMinutes: 200,
            },
        ];

        const mockData = mockDataVariants[variant % mockDataVariants.length];

        return {
            employeeId: yawareUserId,
            date: dateStr,
            ...mockData,
            applications: [],
        };
    }

    /**
     * Generate consistent variant for user
     */
    private getUserVariant(userId: string): number {
        return userId.charCodeAt(0) % 4;
    }
}
