import { Injectable } from '@nestjs/common';

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
    /**
     * Get integrations snapshot for a user on a specific date
     * Currently uses mock data - will be replaced with real integrations
     */
    async getSnapshot(userId: string, date: Date): Promise<IntegrationsSnapshot | null> {
        // Mock data for demonstration
        // In production, this would call Google Calendar and Yaware APIs

        const mockCalendarBlocks = this.getMockCalendarBlocks(userId, date);
        const mockYawareData = this.getMockYawareData(userId, date);

        const plannedFocusMinutes = mockCalendarBlocks.reduce(
            (sum, block) => sum + block.durationMinutes,
            0
        );

        const focusTimeMinutes = mockYawareData.focusTimeMinutes;
        const focusTimeDelta = focusTimeMinutes - plannedFocusMinutes;
        const focusTimePercentage = plannedFocusMinutes > 0
            ? Math.round((focusTimeMinutes / plannedFocusMinutes) * 100)
            : 0;

        return {
            focusTimeMinutes,
            plannedFocusMinutes,
            focusTimeDelta,
            focusTimePercentage,
            calendarBlocks: mockCalendarBlocks,
            yawareData: mockYawareData,
        };
    }

    /**
     * Mock Google Calendar data
     * TODO: Replace with real Google Calendar API integration
     */
    private getMockCalendarBlocks(userId: string, date: Date): CalendarBlock[] {
        // Generate different mock data based on userId hash for variety
        const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variant = userHash % 3;

        if (variant === 0) {
            // Good planner - has focus blocks
            return [
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
            ];
        } else if (variant === 1) {
            // Moderate planner - some focus blocks
            return [
                {
                    start: '10:00',
                    end: '12:00',
                    title: 'Focus: Project Work',
                    durationMinutes: 120,
                },
            ];
        } else {
            // No focus blocks scheduled
            return [];
        }
    }

    /**
     * Mock Yaware data
     * TODO: Replace with real Yaware API integration
     */
    private getMockYawareData(userId: string, date: Date): {
        productiveTimeMinutes: number;
        focusTimeMinutes: number;
    } {
        // Generate different mock data based on userId hash
        const userHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variant = userHash % 4;

        if (variant === 0) {
            // Good focus time (meets plan)
            return {
                productiveTimeMinutes: 420, // 7h
                focusTimeMinutes: 200, // 3h 20m
            };
        } else if (variant === 1) {
            // Slightly underfocused (75% of plan)
            return {
                productiveTimeMinutes: 360, // 6h
                focusTimeMinutes: 90, // 1h 30m
            };
        } else if (variant === 2) {
            // Significantly underfocused (50% of plan)
            return {
                productiveTimeMinutes: 300, // 5h
                focusTimeMinutes: 60, // 1h
            };
        } else {
            // Exceeds plan
            return {
                productiveTimeMinutes: 480, // 8h
                focusTimeMinutes: 250, // 4h 10m
            };
        }
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
}
