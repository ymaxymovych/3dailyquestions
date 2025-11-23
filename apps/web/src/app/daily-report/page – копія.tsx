"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import {
    getDailyReportByDate,
    createDailyReport,
    updateDailyReport,
    yesterdayMedium: [],
    yesterdaySmall: { count: 0 },
todayBig: [{ title: '' }],
    todayMedium: [],
        todaySmall: { count: 0 },
helpRequests: [],
    mood: 3,
        },
    });

const formData = watch();
setValue('mood', res.data.mood || 3);
setValue('wellbeing', res.data.wellbeing);
            }
        })
        .catch (() => { })
        .finally(() => setLoading(false));
}, [user, setValue]);

useEffect(() => {
    if (!user || loading) return;
    const timer = setInterval(() => {
        handleSave(formData, true);
    }, 3000);
    return () => clearInterval(timer);
}, [user, loading, formData]);

const handleSave = useCallback(
    async (data: CreateDailyReportDto, silent = false) => {
        try {
            if (reportId) {
                await updateDailyReport(reportId, data);
            } else {
                const res = await createDailyReport(data);
                setReportId(res.data.id);
            }
            setLastSaved(new Date());
            if (!silent) toast.success('Збережено');
        } catch (error) {
            console.error(error);
            if (!silent) toast.error('Помилка збереження');
        }
    },
    [reportId]
);

const handlePublish = async () => {
    const yesterdayBig = formData.yesterdayBig || [];
    const yesterdayMedium = formData.yesterdayMedium || [];
    const todayBig = formData.todayBig || [];
    const todayMedium = formData.todayMedium || [];
                <Card>
                    <CardHeader>
                        <CardTitle>A. Що я зробив учора</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Велика справа</Label>
                            {yesterdayBig.map((_, index) => (
                                <div key={index} className="flex gap-2 mt-2">
                                    <Input placeholder="Назва" {...register(`yesterdayBig.${index}.title`)} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const updated = yesterdayBig.filter((_, i) => i !== index);
                                            setValue('yesterdayBig', updated);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setValue('yesterdayBig', [...yesterdayBig, { title: '' }])}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Додати
                            </Button>
                        </div>

                        <div>
                            <Label>Середні</Label>
                            {yesterdayMedium.map((_, index) => (
                                <div key={index} className="flex gap-2 mt-2">
                                    <Input placeholder="Назва" {...register(`yesterdayMedium.${index}.title`)} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const updated = yesterdayMedium.filter((_, i) => i !== index);
                                            setValue('yesterdayMedium', updated);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setValue('yesterdayMedium', [...yesterdayMedium, { title: '' }])}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Додати
                            </Button>
                        </div>

                        <div>
                            <Label>Дрібні (кількість)</Label>
                            <Input
                                type="number"
                                {...register('yesterdaySmall.count', { valueAsNumber: true })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>B. План на сьогодні</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Велика справа *</Label>
                            {todayBig.map((_, index) => (
                                <div key={index} className="flex gap-2 mt-2">
                                    <Input placeholder="Назва" {...register(`todayBig.${index}.title`)} />
                                    {todayBig.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const updated = todayBig.filter((_, i) => i !== index);
                                                setValue('todayBig', updated);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label>Середні</Label>
                            {todayMedium.map((_, index) => (
                                <div key={index} className="flex gap-2 mt-2">
                                    <Input placeholder="Назва" {...register(`todayMedium.${index}.title`)} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const updated = todayMedium.filter((_, i) => i !== index);
                                            setValue('todayMedium', updated);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setValue('todayMedium', [...todayMedium, { title: '' }])}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Додати
                            </Button>
                        </div>

                        <div>
                            <Label>Дрібні (кількість)</Label>
                            <Input
                                type="number"
                                {...register('todaySmall.count', { valueAsNumber: true })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>D. Настрій</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Настрій (1–5)</Label>
                            <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        variant={formData.mood === value ? 'default' : 'outline'}
                                        onClick={() => setValue('mood', value)}
                                    >
                                        {value}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Самопочуття</Label>
                            <Input placeholder="ок / втома / стрес" {...register('wellbeing')} />
                        </div>
                    </CardContent>
                </Card>
            </div >
        </AppLayout >
    );
}
