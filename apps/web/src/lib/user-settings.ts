import api from './api';

// --- Interfaces ---

export interface UserProfile {
    id: string;
    userId: string;
    jobTitle?: string;
    department?: string;
    bio?: string;
    avatarUrl?: string;
    phone?: string;
}

export interface UserPreferences {
    id: string;
    userId: string;
    language: 'UK' | 'EN';
    timezone: string;
    workDayStart: string;
    workDayEnd: string;
    isAutoBookFocus: boolean;
    privacyAggregatedOnly: boolean;
}

export interface Integration {
    id: string;
    userId: string;
    type: 'YAWARE' | 'GMAIL' | 'CALENDAR' | 'JIRA';
    isEnabled: boolean;
    settings?: any;
    // Credentials are never returned fully, maybe masked or just existence check
}

export interface KPI {
    id: string;
    userId: string;
    name: string;
    targetValue: number;
    unit: string;
    period: 'DAY' | 'WEEK' | 'MONTH';
    source: 'MANUAL' | 'INTEGRATION';
}

// --- API Calls ---

// Profile
export const getProfile = async (): Promise<UserProfile> => {
    const res = await api.get('/user-settings/profile');
    return res.data;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await api.patch('/user-settings/profile', data);
    return res.data;
};

// Preferences
export const getPreferences = async (): Promise<UserPreferences> => {
    const res = await api.get('/user-settings/preferences');
    return res.data;
};

export const updatePreferences = async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const res = await api.patch('/user-settings/preferences', data);
    return res.data;
};

// Integrations
export const getIntegrations = async (): Promise<Integration[]> => {
    const res = await api.get('/user-settings/integrations');
    return res.data;
};

export const updateIntegration = async (data: { type: string; credentials?: any; settings?: any; isEnabled?: boolean }): Promise<Integration> => {
    const res = await api.post('/user-settings/integrations', data);
    return res.data;
};

// KPIs
export const getKpis = async (): Promise<KPI[]> => {
    const res = await api.get('/user-settings/kpis');
    return res.data;
};

export const createKpi = async (data: Omit<KPI, 'id' | 'userId'>): Promise<KPI> => {
    const res = await api.post('/user-settings/kpis', data);
    return res.data;
};

export const deleteKpi = async (id: string): Promise<void> => {
    await api.delete(`/user-settings/kpis/${id}`);
};
