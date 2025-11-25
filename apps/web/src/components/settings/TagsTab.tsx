import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag, type Tag, type CreateTagDto } from '@/lib/tags';
import { useAuth } from '@/context/AuthContext';

export function TagsTab() {
    const { user } = useAuth();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateTagDto>({ name: '', color: '#808080' });

    useEffect(() => {
        if (!user) return;
        loadTags();
    }, [user]);

    const loadTags = async () => {
        try {
            const res = await getTags();
            setTags(res.data);
        } catch (error) {
            toast.error('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Tag name is required');
            return;
        }

        try {
            await createTag(formData);
            toast.success('Tag created');
            setFormData({ name: '', color: '#808080' });
            loadTags();
        } catch (error) {
            toast.error('Failed to create tag');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) {
            toast.error('Tag name is required');
            return;
        }

        try {
            await updateTag(id, formData);
            toast.success('Tag updated');
            setEditing(null);
            setFormData({ name: '', color: '#808080' });
            loadTags();
        } catch (error) {
            toast.error('Failed to update tag');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tag?')) return;

        try {
            await deleteTag(id);
            toast.success('Tag deleted');
            loadTags();
        } catch (error) {
            toast.error('Failed to delete tag');
        }
    };

    const startEdit = (tag: Tag) => {
        setEditing(tag.id);
        setFormData({ name: tag.name, color: tag.color });
    };

    const cancelEdit = () => {
        setEditing(null);
        setFormData({ name: '', color: '#808080' });
    };

    if (loading) return <div>Loading tags...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Tag</CardTitle>
                    <CardDescription>Add tags to categorize your tasks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Tag Name *</Label>
                        <Input
                            placeholder="e.g. Urgent"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-20 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="#808080"
                                className="font-mono"
                            />
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Tag
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Tags ({tags.length})</CardTitle>
                    <CardDescription>Manage your active tags.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags found.</p>}
                        {tags.map((tag) => (
                            <div key={tag.id} className="flex items-center gap-2 p-3 border rounded-md">
                                {editing === tag.id ? (
                                    <div className="flex-1 flex gap-2 items-center">
                                        <Input
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <Input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-12 h-10 p-1"
                                        />
                                        <Button size="sm" onClick={() => handleUpdate(tag.id)}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="w-6 h-6 rounded-full border"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="flex-1 font-medium">{tag.name}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => startEdit(tag)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
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
