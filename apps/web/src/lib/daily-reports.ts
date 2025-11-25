import api from '@/lib/api';

// Types matching backend DTOs
export interface BigTask {
    title: string;
    project?: string;
    timeboxH: number; // 2-4
    artifact?: string;
    status?: 'done' | 'partial' | 'moved';
    note?: string;
    tags?: string[];
}

export interface MediumTask {
    title: string;
    project?: string;
    timeboxH: number; // 0.33-1
    artifact?: string;
    status?: 'done' | 'partial' | 'moved';
    tags?: string[];
}

export interface SmallTasks {
    count?: number;
    items?: string[];
}

export interface HelpRequest {
    id?: string;
    text: string;
    link?: string;
    assigneeId?: string;
    dueDate: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    status?: string;
}

export interface DailyReport {
    id: string;
    date: string;
    userId: string;

    // Yesterday
    yesterdayBig?: BigTask[];
    yesterdayMedium?: MediumTask[];
    yesterdaySmall?: SmallTasks;
    yesterdayNote?: string;
    coveragePct?: number;

    // Today
    todayBig?: BigTask[];
    todayMedium?: MediumTask[];
    todaySmall?: SmallTasks;
    todayNote?: string;

    // Help
    helpRequests?: HelpRequest[];

    // Mood
    mood?: number; // 1-5
    wellbeing?: string;
    moodComment?: string;

    // KPIs
    kpis?: DailyReportKPI[];

    // Meta
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DailyReportKPI {
    id?: string;
    kpiCode: string;
    value: number;
    goal?: number;
    comment?: string;
}

export interface CreateDailyReportDto {
    date: string;
    yesterdayBig?: BigTask[];
    yesterdayMedium?: MediumTask[];
    yesterdaySmall?: SmallTasks;
    yesterdayNote?: string;
    todayBig?: BigTask[];
    todayMedium?: MediumTask[];
    todaySmall?: SmallTasks;
    todayNote?: string;
    helpRequests?: Omit<HelpRequest, 'id' | 'status'>[];
    kpis?: Omit<DailyReportKPI, 'id'>[];
    mood?: number;
    wellbeing?: string;
    moodComment?: string;
}

// API functions
export const createDailyReport = (dto: CreateDailyReportDto) => {
    return api.post<DailyReport>('/daily-reports', dto);
};

export const getDailyReports = () => {
    return api.get<DailyReport[]>('/daily-reports');
};

export const getDailyReportByDate = (date: string) => {
    return api.get<DailyReport>(`/daily-reports?date=${date}`);
};

export const getDailyReport = (id: string) => {
    return api.get<DailyReport>(`/daily-reports/${id}`);
};

export const updateDailyReport = (id: string, dto: Partial<CreateDailyReportDto>) => {
    return api.patch<DailyReport>(`/daily-reports/${id}`, dto);
};

export const publishDailyReport = (id: string) => {
    return api.patch<DailyReport>(`/daily-reports/${id}/publish`);
};

export const deleteDailyReport = (id: string) => {
    return api.delete(`/daily-reports/${id}`);
};
