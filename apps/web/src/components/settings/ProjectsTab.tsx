import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, type Project, type CreateProjectDto } from '@/lib/projects';
import { useAuth } from '@/context/AuthContext';

export function ProjectsTab() {
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
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Project name is required');
            return;
        }

        try {
            await createProject(formData);
            toast.success('Project created');
            setFormData({ name: '', description: '' });
            loadProjects();
        } catch (error) {
            toast.error('Failed to create project');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) {
            toast.error('Project name is required');
            return;
        }

        try {
            await updateProject(id, formData);
            toast.success('Project updated');
            setEditing(null);
            setFormData({ name: '', description: '' });
            loadProjects();
        } catch (error) {
            toast.error('Failed to update project');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await deleteProject(id);
            toast.success('Project deleted');
            loadProjects();
        } catch (error) {
            toast.error('Failed to delete project');
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

    if (loading) return <div>Loading projects...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>Add a new project to your workspace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Project Name *</Label>
                        <Input
                            placeholder="e.g. Website Redesign"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Project goals and details..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Projects ({projects.length})</CardTitle>
                    <CardDescription>Manage your active projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects found.</p>}
                        {projects.map((project) => (
                            <div key={project.id} className="flex items-start gap-2 p-3 border rounded-md">
                                {editing === project.id ? (
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleUpdate(project.id)}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="font-medium">{project.name}</p>
                                            {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => startEdit(project)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
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
