import api from './api';

export interface Tag {
    id: string;
    name: string;
    color: string;
    orgId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTagDto {
    name: string;
    color?: string;
}

export const getTags = () => api.get<Tag[]>('/tags');
export const getTag = (id: string) => api.get<Tag>(`/tags/${id}`);
export const createTag = (dto: CreateTagDto) => api.post<Tag>('/tags', dto);
export const updateTag = (id: string, dto: CreateTagDto) => api.patch<Tag>(`/tags/${id}`, dto);
export const deleteTag = (id: string) => api.delete(`/tags/${id}`);
