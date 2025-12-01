'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import axios from 'axios';

export default function SystemSettingsPage() {
    const [useMinimalisticDesign, setUseMinimalisticDesign] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const response = await axios.get(`${apiUrl}/user-settings/preferences`);
                setUseMinimalisticDesign(response.data.useMinimalisticDesign || false);
            } catch (error) {
                toast.error('Не вдалося завантажити налаштування');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleToggle = async (checked: boolean) => {
        setIsSaving(true);
        setUseMinimalisticDesign(checked);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            await axios.patch(`${apiUrl}/user-settings/preferences`, {
                useMinimalisticDesign: checked,
            });
            toast.success('Налаштування збережено');
        } catch (error) {
            toast.error('Не вдалося зберегти налаштування');
            setUseMinimalisticDesign(!checked); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Завантаження...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Системні налаштування</h1>
                <p className="text-muted-foreground mt-2">
                    Налаштуйте загальні параметри системи
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Інтерфейс</CardTitle>
                    <CardDescription>
                        Налаштування відображення та поведінки інтерфейсу
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="minimalistic-design">Мінімалістичний дизайн</Label>
                            <p className="text-sm text-muted-foreground">
                                Використовувати спрощений дизайн для екрану "3 Блоки" (без структурованих заголовків)
                            </p>
                        </div>
                        <Switch
                            id="minimalistic-design"
                            checked={useMinimalisticDesign}
                            onCheckedChange={handleToggle}
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
