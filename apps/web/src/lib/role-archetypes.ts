import api from './api';

// --- Interfaces ---

export interface KPITemplate {
    id: string;
    code: string;
    name: string;
    description: string | null;
    unit: string;
    direction: 'HIGHER_BETTER' | 'LOWER_BETTER' | 'TARGET_VALUE';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface RoleArchetype {
    id: string;
    code: string;
    name: string;
    level: 'IC' | 'TEAMLEAD' | 'HEAD' | 'CLEVEL';
    description: string | null;
    kpis?: KPITemplate[];
}

export interface DepartmentArchetype {
    id: string;
    code: string;
    name: string;
    description: string | null;
    roles?: RoleArchetype[];
}

// --- API Calls ---

export const getAllDepartments = async (): Promise<DepartmentArchetype[]> => {
    const res = await api.get('/role-archetypes/departments');
    return res.data;
};

export const getDepartmentByCode = async (code: string): Promise<DepartmentArchetype> => {
    const res = await api.get(`/role-archetypes/departments/${code}`);
    return res.data;
};

export const getRoleByCode = async (code: string): Promise<RoleArchetype> => {
    const res = await api.get(`/role-archetypes/roles/${code}`);
    return res.data;
};

export const getRoleKPIs = async (code: string): Promise<KPITemplate[]> => {
    const res = await api.get(`/role-archetypes/roles/${code}/kpis`);
    return res.data;
};
