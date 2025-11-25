import api from './api';

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
    orgId: string;
    deptId?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectDto {
    name: string;
    description?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
}

export const getProjects = () => api.get<Project[]>('/projects');
export const getProject = (id: string) => api.get<Project>(`/projects/${id}`);
export const createProject = (dto: CreateProjectDto) => api.post<Project>('/projects', dto);
export const updateProject = (id: string, dto: CreateProjectDto) => api.patch<Project>(`/projects/${id}`, dto);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);
