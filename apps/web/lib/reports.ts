import api from '@/lib/api';

export interface CreateActivityDto {
    title: string;
    description?: string;
    durationMinutes?: number;
}

export interface CreateReportDto {
    date: string; // ISO string
    summary: string;
    mood?: string;
    activities: CreateActivityDto[];
}

export interface Report {
    id: string;
    date: string;
    summary: string;
    mood?: string;
    activities: Activity[];
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    id: string;
    title: string;
    description?: string;
    duration: number; // seconds
    source: string;
    userId: string;
}

export const createReport = (dto: CreateReportDto) => {
    return api.post('/reports', dto);
};

export const getReports = () => {
    return api.get<Report[]>('/reports');
};

export const getReport = (id: string) => {
    return api.get<Report>(`/reports/${id}`);
};
