"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, type Project, type CreateProjectDto } from '@/lib/projects';

export default function ProjectsSettingsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateProjectDto>({ name: '', description: '' });

    useEffect(() => {
        if (!user) return;
        loadProjects();
    }, [user]);

    const loadProjects = async () => {
        try {
            const res = await getProjects();
            setProjects(res.data);
        } catch (error) {
            toast.error('Помилка завантаження проектів');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Вкажіть назву проекту');
            return;
        }

        try {
            await createProject(formData);
            toast.success('Проект створено');
            setFormData({ name: '', description: '' });
            loadProjects();
        } catch (error) {
            toast.error('Помилка створення проекту');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) {
            toast.error('Вкажіть назву проекту');
            return;
        }

        try {
            await updateProject(id, formData);
            toast.success('Проект оновлено');
            setEditing(null);
            setFormData({ name: '', description: '' });
            loadProjects();
        } catch (error) {
            toast.error('Помилка оновлення проекту');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити цей проект?')) return;

        try {
            await deleteProject(id);
            toast.success('Проект видалено');
            loadProjects();
        } catch (error) {
            toast.error('Помилка видалення проекту');
        }
    };

    const startEdit = (project: Project) => {
        setEditing(project.id);
        setFormData({ name: project.name, description: project.description });
    };

    const cancelEdit = () => {
        setEditing(null);
        setFormData({ name: '', description: '' });
    };

    if (!user) return null;
    if (loading) return <div className="p-8">Завантаження...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Проекти</h1>
                <p className="text-sm text-muted-foreground">Керування проектами організації</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Створити новий проект</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Назва проекту *</Label>
                        <Input
                            placeholder="Назва проекту"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>Опис</Label>
                        <Textarea
                            placeholder="Опис проекту"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Додати проект
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Існуючі проекти ({projects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {projects.length === 0 && <p className="text-sm text-muted-foreground">Проектів ще немає</p>}
                        {projects.map((project) => (
                            <div key={project.id} className="flex items-start gap-2 p-3 border rounded">
                                {editing === project.id ? (
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder="Назва"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Опис"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleUpdate(project.id)}>Зберегти</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Скасувати</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="font-medium">{project.name}</p>
                                            {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(project)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
