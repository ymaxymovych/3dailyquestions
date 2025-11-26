import { Injectable } from '@nestjs/common';

export interface AIFlags {
    riskLevel: 'none' | 'low' | 'medium' | 'high';
    hasBlocker: boolean;
    noBigTask: boolean;
    noBigTaskDays: number;
    overloaded: boolean;
    underfocused: boolean;
    notSubmittedDays: number;
    suggestion: string;
}

@Injectable()
export class AiFlagsService {
    /**
     * Calculate AI flags for an employee based on their reports
     */
    calculateFlags(
        currentReport: any | null,
        recentReports: any[],
        status: 'submitted' | 'not_submitted',
        integrationsSnapshot?: any
    ): AIFlags {
        const flags: AIFlags = {
            riskLevel: 'none',
            hasBlocker: false,
            noBigTask: false,
            noBigTaskDays: 0,
            overloaded: false,
            underfocused: false,
            notSubmittedDays: 0,
            suggestion: '',
        };

        // Check if has blocker (help request)
        if (currentReport?.helpRequests && currentReport.helpRequests.length > 0) {
            flags.hasBlocker = true;
        }

        // Check for "no Big task" pattern
        const noBigTaskDays = this.detectNoBigTaskPattern(recentReports);
        flags.noBigTask = noBigTaskDays > 0;
        flags.noBigTaskDays = noBigTaskDays;

        // Check if overloaded
        if (currentReport) {
            flags.overloaded = this.detectOverload(currentReport);
        }

        // Check not submitted pattern
        flags.notSubmittedDays = this.detectNotSubmittedPattern(recentReports, status);

        // Check underfocused (if integrations data available)
        if (integrationsSnapshot) {
            flags.underfocused = integrationsSnapshot.focusTimePercentage < 70 &&
                integrationsSnapshot.plannedFocusMinutes > 0;
        }

        // Calculate risk level
        flags.riskLevel = this.calculateRiskLevel(flags);

        // Generate suggestion
        flags.suggestion = this.generateSuggestion(flags);

        return flags;
    }

    /**
     * Detect if employee has no Big task for N days
     */
    private detectNoBigTaskPattern(reports: any[]): number {
        if (!reports || reports.length === 0) return 0;

        let consecutiveDays = 0;

        // Sort by date descending (newest first)
        const sortedReports = [...reports].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (const report of sortedReports) {
            const hasBigTask = report.todayBig &&
                Array.isArray(report.todayBig) &&
                report.todayBig.length > 0;

            if (!hasBigTask) {
                consecutiveDays++;
            } else {
                break; // Stop counting when we find a Big task
            }
        }

        return consecutiveDays;
    }

    /**
     * Detect if employee is overloaded with tasks
     */
    private detectOverload(report: any): boolean {
        let mediumCount = 0;
        let smallCount = 0;

        // Count Medium tasks
        if (report.todayMedium && Array.isArray(report.todayMedium)) {
            mediumCount = report.todayMedium.length;
        }

        // Count Small tasks
        if (report.todaySmall && report.todaySmall.items && Array.isArray(report.todaySmall.items)) {
            smallCount = report.todaySmall.items.length;
        }

        // Overloaded if: 5+ Medium tasks OR 7+ Small tasks
        return mediumCount >= 5 || smallCount >= 7;
    }

    /**
     * Detect consecutive days without submission
     */
    private detectNotSubmittedPattern(reports: any[], currentStatus: string): number {
        if (currentStatus === 'submitted') return 0;

        // Count how many recent reports are missing
        let consecutiveDays = 1; // Current day not submitted

        const sortedReports = [...reports].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Check if recent reports exist (if they don't, it means not submitted)
        // This is simplified - in production you'd check against expected work days

        return consecutiveDays;
    }

    /**
     * Calculate overall risk level based on flags
     */
    private calculateRiskLevel(flags: AIFlags): 'none' | 'low' | 'medium' | 'high' {
        // HIGH RISK: Critical issues
        if (
            (flags.hasBlocker && flags.noBigTaskDays >= 3) ||
            flags.notSubmittedDays >= 2
        ) {
            return 'high';
        }

        // MEDIUM RISK: Concerning patterns
        if (
            flags.hasBlocker ||
            flags.noBigTaskDays >= 2 ||
            flags.overloaded ||
            flags.underfocused ||
            flags.notSubmittedDays === 1
        ) {
            return 'medium';
        }

        // LOW RISK: Minor issues
        if (flags.noBigTaskDays === 1) {
            return 'low';
        }

        // NO RISK: All good
        return 'none';
    }

    /**
     * Generate actionable suggestion for manager
     */
    private generateSuggestion(flags: AIFlags): string {
        const suggestions: string[] = [];

        // Critical issues first
        if (flags.notSubmittedDays >= 2) {
            suggestions.push(`Не заповнює звіти ${flags.notSubmittedDays} дні підряд - терміново зв'язатися`);
        }

        if (flags.hasBlocker && flags.noBigTaskDays >= 3) {
            suggestions.push('Критично: Є блокер і немає Big-задачі 3+ днів - негайно допомогти');
        }

        // Important issues
        if (flags.hasBlocker && !suggestions.length) {
            suggestions.push('Є запит на допомогу - перевірити чи надана підтримка');
        }

        if (flags.noBigTaskDays >= 3 && !suggestions.length) {
            suggestions.push(`Немає Big-задачі ${flags.noBigTaskDays} днів - обговорити пріоритети та фокус`);
        }

        if (flags.noBigTaskDays === 2 && !suggestions.length) {
            suggestions.push('Другий день без Big-задачі - уточнити чи є чіткий фокус');
        }

        if (flags.overloaded) {
            suggestions.push('Перевантажений задачами - розглянути зменшення обсягу або делегування');
        }

        if (flags.underfocused) {
            suggestions.push('Фактичний фокус-тайм < 70% від запланованого - обговорити причини');
        }

        // Minor issues
        if (flags.noBigTaskDays === 1 && !suggestions.length) {
            suggestions.push('Сьогодні немає Big-задачі - можливо варто визначити головний фокус');
        }

        if (flags.notSubmittedDays === 1 && !suggestions.length) {
            suggestions.push('Не заповнив звіт сьогодні - нагадати про важливість щоденних звітів');
        }

        // All good
        if (suggestions.length === 0) {
            return 'Все добре - працює за планом';
        }

        return suggestions.join('. ');
    }
}
