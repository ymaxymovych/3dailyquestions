"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag, type Tag, type CreateTagDto } from '@/lib/tags';

export default function TagsSettingsPage() {
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
            toast.error('Помилка завантаження тегів');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Вкажіть назву тегу');
            return;
        }

        try {
            await createTag(formData);
            toast.success('Тег створено');
            setFormData({ name: '', color: '#808080' });
            loadTags();
        } catch (error) {
            toast.error('Помилка створення тегу');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim()) {
            toast.error('Вкажіть назву тегу');
            return;
        }

        try {
            await updateTag(id, formData);
            toast.success('Тег оновлено');
            setEditing(null);
            setFormData({ name: '', color: '#808080' });
            loadTags();
        } catch (error) {
            toast.error('Помилка оновлення тегу');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Видалити цей тег?')) return;

        try {
            await deleteTag(id);
            toast.success('Тег видалено');
            loadTags();
        } catch (error) {
            toast.error('Помилка видалення тегу');
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

    if (!user) return null;
    if (loading) return <div className="p-8">Завантаження...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Теги</h1>
                <p className="text-sm text-muted-foreground">Керування тегами для завдань</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Створити новий тег</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Назва тегу *</Label>
                        <Input
                            placeholder="Назва тегу"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>Колір</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-20"
                            />
                            <Input
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="#808080"
                            />
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Додати тег
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Існуючі теги ({tags.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {tags.length === 0 && <p className="text-sm text-muted-foreground">Тегів ще немає</p>}
                        {tags.map((tag) => (
                            <div key={tag.id} className="flex items-center gap-2 p-3 border rounded">
                                {editing === tag.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            placeholder="Назва"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <Input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-20"
                                        />
                                        <Button size="sm" onClick={() => handleUpdate(tag.id)}>Зберегти</Button>
                                        <Button size="sm" variant="outline" onClick={cancelEdit}>Скасувати</Button>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="w-6 h-6 rounded"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="flex-1 font-medium">{tag.name}</span>
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(tag)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
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
