import { Injectable } from '@nestjs/common';
import { TaskType, MetricScope } from '@repo/database';

export interface ParsedTask {
    type: TaskType;
    title: string;
    estimateMinutes: number;
    plannedStart?: Date;
    plannedEnd?: Date;
    rawLine: string;
}

export interface ParsedMetric {
    scope: MetricScope;
    name: string;
    value: number;
    comment?: string;
}

export interface ParsedDailyPlan {
    tasks: ParsedTask[];
    metrics: ParsedMetric[];
}

@Injectable()
export class TextParserService {
    parseDailyText(text: string, date: Date): ParsedDailyPlan {
        const lines = text.split('\n');
        const tasks: ParsedTask[] = [];
        const metrics: ParsedMetric[] = [];

        let currentSection: 'BIG' | 'MEDIUM' | 'SMALL' | 'METRICS_YESTERDAY' | 'METRICS_TODAY' | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine || trimmedLine === '---') continue;

            // Detect Section Headings
            if (trimmedLine.includes('Одна Велика справа')) {
                currentSection = 'BIG';
                continue;
            } else if (trimmedLine.includes('середніх справ')) {
                currentSection = 'MEDIUM';
                continue;
            } else if (trimmedLine.includes('Дрібні справи')) {
                currentSection = 'SMALL';
                continue;
            } else if (trimmedLine.includes('Метрики за вчора')) {
                currentSection = 'METRICS_YESTERDAY';
                continue;
            } else if (trimmedLine.includes('Очікувані метрики')) {
                currentSection = 'METRICS_TODAY';
                continue;
            }

            // Parse Content based on Section
            if (currentSection === 'BIG' || currentSection === 'MEDIUM' || currentSection === 'SMALL') {
                const task = this.parseTaskLine(trimmedLine, currentSection as TaskType, date);
                if (task) tasks.push(task);
            } else if (currentSection === 'METRICS_YESTERDAY' || currentSection === 'METRICS_TODAY') {
                const metric = this.parseMetricLine(trimmedLine, currentSection === 'METRICS_YESTERDAY' ? MetricScope.YESTERDAY : MetricScope.TODAY_PLAN);
                if (metric) metrics.push(metric);
            }
        }

        return { tasks, metrics };
    }

    private parseTaskLine(line: string, type: TaskType, date: Date): ParsedTask | null {
        // Ignore instructional text
        if (line.startsWith('Опишіть') || line.startsWith('Час вказуйте') || line.startsWith('Порада') || line.startsWith('Що зміниться')) {
            return null;
        }

        // Extract time info
        const timeRange = this.parseTimeRange(line, date);
        const duration = this.parseDuration(line);

        let estimateMinutes = 0;
        let plannedStart: Date | undefined;
        let plannedEnd: Date | undefined;

        if (timeRange) {
            plannedStart = timeRange.start;
            plannedEnd = timeRange.end;
            estimateMinutes = (plannedEnd.getTime() - plannedStart.getTime()) / (1000 * 60);
        } else if (duration) {
            estimateMinutes = duration;
        }

        // Clean title: remove time info in parens if it exists
        // Regex looks for (...) at the end or middle, containing digits
        const title = line.replace(/\s*\([^)]*\d[^)]*\)/g, '').trim();

        if (!title) return null;

        return {
            type,
            title,
            estimateMinutes,
            plannedStart,
            plannedEnd,
            rawLine: line,
        };
    }

    private parseTimeRange(line: string, date: Date): { start: Date, end: Date } | null {
        // Matches: 10:00-13:00, 10:00–13:00, 09:30 - 11:00
        const timeRangeRegex = /(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/;
        const match = line.match(timeRangeRegex);

        if (match) {
            const [_, startStr, endStr] = match;

            const start = new Date(date);
            const [startH, startM] = startStr.split(':').map(Number);
            start.setHours(startH, startM, 0, 0);

            const end = new Date(date);
            const [endH, endM] = endStr.split(':').map(Number);
            end.setHours(endH, endM, 0, 0);

            // Handle overnight tasks? For now assume same day
            if (end < start) {
                end.setDate(end.getDate() + 1);
            }

            return { start, end };
        }
        return null;
    }

    private parseDuration(line: string): number | null {
        // Matches: (45 хв), (1 год 30 хв), (3 години)
        let minutes = 0;

        const hoursMatch = line.match(/(\d+)\s*(год|h|hour)/i);
        if (hoursMatch) {
            minutes += parseInt(hoursMatch[1]) * 60;
        }

        const minutesMatch = line.match(/(\d+)\s*(хв|min|m\b)/i);
        if (minutesMatch) {
            minutes += parseInt(minutesMatch[1]);
        }

        return minutes > 0 ? minutes : null;
    }

    private parseMetricLine(line: string, scope: MetricScope): ParsedMetric | null {
        // Format: Name: Value Comment
        // Example: Sales: 2 deals

        // Ignore instructional text
        if (line.startsWith('Напишіть') || line.startsWith('Формат')) return null;

        const parts = line.split(':');
        if (parts.length < 2) return null;

        const name = parts[0].trim();
        const rest = parts.slice(1).join(':').trim();

        // Extract first number
        const valueMatch = rest.match(/(\d+([.,]\d+)?)/);
        if (!valueMatch) return null;

        const value = parseFloat(valueMatch[1].replace(',', '.'));

        // Comment is everything after the number? Or just the text?
        // Let's take the whole rest string as comment for now, or try to clean it
        // "2 deals" -> value: 2, comment: "deals"
        const comment = rest.replace(valueMatch[0], '').trim();

        return {
            scope,
            name,
            value,
            comment: comment || undefined,
        };
    }
}
