import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YawareService } from '../integrations/yaware/yaware.service';
import { format, differenceInMinutes } from 'date-fns';

export interface CalendarBlock {
    start: string;
    end: string;
    title: string;
    durationMinutes: number;
}

export interface IntegrationsSnapshot {
    focusTimeMinutes: number;
    plannedFocusMinutes: number;
    focusTimeDelta: number;
    focusTimePercentage: number;
    calendarBlocks: CalendarBlock[];
    yawareData?: {
        productiveTimeMinutes: number;
        focusTimeMinutes: number;
    };
}

@Injectable()
export class IntegrationsSnapshotService {
    constructor(
        private prisma: PrismaService,
        private yawareService: YawareService,
    ) { }

    /**
     * Get integrations snapshot for a user on a specific date
     * Uses real Yaware API (or mock fallback) and mock Calendar data
     */
    async getSnapshot(userId: string, date: Date): Promise<IntegrationsSnapshot> {
        // Get Calendar data (mock for now)
        const calendarData = this.getCalendarFocusTime(userId);

        // Get Yaware data (real API or mock fallback)
        const yawareData = await this.getYawareFocusTime(userId, date);

        // Calculate plan vs fact
        const plannedFocusMinutes = calendarData.plannedFocusMinutes;
        const actualFocusMinutes = yawareData.focusTimeMinutes;
        const focusTimeDelta = actualFocusMinutes - plannedFocusMinutes;
        const focusTimePercentage =
            plannedFocusMinutes > 0
                ? Math.round((actualFocusMinutes / plannedFocusMinutes) * 100)
                : 0;

        return {
            focusTimeMinutes: actualFocusMinutes,
            plannedFocusMinutes,
            focusTimeDelta,
            focusTimePercentage,
            calendarBlocks: calendarData.calendarBlocks,
            yawareData: {
                productiveTimeMinutes: yawareData.productiveTimeMinutes,
                focusTimeMinutes: yawareData.focusTimeMinutes,
            },
        };
    }

    /**
     * Get Calendar focus time data (mock)
     * TODO: Replace with real Google Calendar API integration
     */
    private getCalendarFocusTime(userId: string) {
        const variant = this.getUserVariant(userId);

        const mockCalendarBlocks: CalendarBlock[][] = [
            // Good planner - has focus blocks
            [
                {
                    start: '09:30',
                    end: '11:00',
                    title: 'Focus: Deep Work',
                    durationMinutes: 90,
                },
                {
                    start: '14:00',
                    end: '16:00',
                    title: 'Focus: Code Review & Development',
                    durationMinutes: 120,
                },
            ],
            // Moderate planner - some focus blocks
            [
                {
                    start: '10:00',
                    end: '12:00',
                    title: 'Focus: Project Work',
                    durationMinutes: 120,
                },
            ],
            // No focus blocks scheduled
            [],
        ];

        const calendarBlocks = mockCalendarBlocks[variant % mockCalendarBlocks.length];
        const plannedFocusMinutes = calendarBlocks.reduce(
            (sum, block) => sum + block.durationMinutes,
            0,
        );

        return {
            plannedFocusMinutes,
            calendarBlocks,
        };
    }

    /**
     * Get Yaware focus time data (real API or mock fallback)
     */
    private async getYawareFocusTime(userId: string, date: Date) {
        // For now, use userId as yawareUserId (will be replaced with actual mapping)
        const yawareUserId = userId;

        // Fetch productivity data from Yaware API (or mock data)
        const productivityData = await this.yawareService.getEmployeeProductivity(
            yawareUserId,
            date,
        );

        return {
            focusTimeMinutes: productivityData.focusTimeMinutes,
            productiveTimeMinutes: productivityData.productiveTimeMinutes,
        };
    }

    /**
     * Check if user is underfocused
     * Threshold: actual < 70% of planned
     */
    isUnderfocused(snapshot: IntegrationsSnapshot): boolean {
        if (snapshot.plannedFocusMinutes === 0) {
            return false; // Can't be underfocused if nothing was planned
        }

        return snapshot.focusTimePercentage < 70;
    }

    /**
     * Generate consistent variant for user
     */
    private getUserVariant(userId: string): number {
        return userId.charCodeAt(0) % 3;
    }
}
