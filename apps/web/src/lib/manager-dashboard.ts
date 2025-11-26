import api from './api';

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

export interface TeamMemberReport {
    userId: string;
    userName: string;
    email: string;
    position: string;
    department: string;
    status: 'submitted' | 'not_submitted';
    submittedAt?: Date;
    hasBigTask: boolean;
    hasHelpRequest: boolean;
    helpRequestsCount: number;
    aiFlags?: AIFlags;
    integrationsSnapshot?: IntegrationsSnapshot;
    report?: {
        id: string;
        yesterdayBig: any;
        yesterdayMedium: any;
        yesterdaySmall: any;
        yesterdayNote?: string;
        todayBig: any;
        todayMedium: any;
        todaySmall: any;
        todayNote?: string;
        mood?: number;
        wellbeing?: string;
        helpRequests: any[];
        kpis: any[];
    };
}

export interface TeamSummary {
    totalMembers: number;
    submitted: number;
    notSubmitted: number;
    completionRate: number;
    withBigTask: number;
    withHelpRequest: number;
    highRisk: number;
    needsAttention: number;
}

export interface DashboardFilters {
    date?: string;
    status?: 'submitted' | 'not_submitted' | 'all';
    hasHelpRequest?: boolean;
    hasBigTask?: boolean;
}

export async function getTeamReports(filters?: DashboardFilters) {
    const params = new URLSearchParams();

    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.hasHelpRequest !== undefined) params.append('hasHelpRequest', String(filters.hasHelpRequest));
    if (filters?.hasBigTask !== undefined) params.append('hasBigTask', String(filters.hasBigTask));

    const response = await api.get<TeamMemberReport[]>(`/manager-dashboard/team-reports?${params.toString()}`);
    return response.data;
}

export async function getTeamSummary(date?: string) {
    const params = date ? `?date=${date}` : '';
    const response = await api.get<TeamSummary>(`/manager-dashboard/summary${params}`);
    return response.data;
}

export async function getEmployeeHistory(userId: string, days: number = 7) {
    const response = await api.get(`/manager-dashboard/employee/${userId}/history?days=${days}`);
    return response.data;
}
