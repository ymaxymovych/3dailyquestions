'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists, if not I'll implement it or use a simple timeout
import BlockYesterday from '@/components/3-blocks/BlockYesterday';
import BlockToday from '@/components/3-blocks/BlockToday';
import BlockHelp from '@/components/3-blocks/BlockHelp';

// Types
interface ThreeBlocksData {
    id?: string;
    date: string;
    yesterdayTasks: string;
    yesterdayMetrics: string;
    todayPlan: string;
    helpNeeded: string;
    status: 'DRAFT' | 'PUBLISHED';
}

export default function ThreeBlocksPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [data, setData] = useState<ThreeBlocksData>({
        date: new Date().toISOString(),
        yesterdayTasks: '',
        yesterdayMetrics: '',
        todayPlan: '',
        helpNeeded: '',
        status: 'DRAFT'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch data when date changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/3-blocks/${date.toISOString()}`);
                setData(response.data);
                setHasUnsavedChanges(false);
            } catch (error) {
                // If 404, it means no data yet, so we keep default empty state but update date
                setData({
                    date: date.toISOString(),
                    yesterdayTasks: '',
                    yesterdayMetrics: '',
                    todayPlan: '',
                    helpNeeded: '',
                    status: 'DRAFT'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [date]);

    // Auto-save logic
    const saveData = useCallback(async (currentData: ThreeBlocksData) => {
        setIsSaving(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/3-blocks/${date.toISOString()}`, {
                yesterdayTasks: currentData.yesterdayTasks,
                yesterdayMetrics: currentData.yesterdayMetrics,
                todayPlan: currentData.todayPlan,
                helpNeeded: currentData.helpNeeded
            });
            setHasUnsavedChanges(false);
        } catch (error) {
            toast.error('Помилка збереження');
        } finally {
            setIsSaving(false);
        }
    }, [date]);

    const debouncedSave = useDebounce((newData: ThreeBlocksData) => {
        saveData(newData);
    }, 3000);

    const handleChange = (field: keyof ThreeBlocksData, value: string) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        setHasUnsavedChanges(true);
        debouncedSave(newData);
    };

    const handlePublish = async () => {
        if (!data.yesterdayTasks && !data.todayPlan) {
            toast.warning('Заповніть хоча б один з перших двох блоків');
            return;
        }

        setIsPublishing(true);
        try {
            // Force save first
            await saveData(data);

            // Publish
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/3-blocks/${date.toISOString()}/publish`);

            setData(prev => ({ ...prev, status: 'PUBLISHED' }));
            toast.success('✅ Опубліковано');
        } catch (error) {
            toast.error('Не вдалося опублікувати');
        } finally {
            setIsPublishing(false);
        }
    };

    const changeDate = (days: number) => {
        if (hasUnsavedChanges) {
            // In a real app we might want to block or confirm, but for now we just save immediately
            saveData(data);
        }
        setDate(prev => addDays(prev, days));
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">3 Ключові Блоки</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(date, "EEEE, d MMMM", { locale: uk })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Save Status */}
                    <div className="text-sm font-medium">
                        {isSaving ? (
                            <span className="text-muted-foreground flex items-center">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Збереження...
                            </span>
                        ) : hasUnsavedChanges ? (
                            <span className="text-muted-foreground">Не збережено</span>
                        ) : (
                            <span className="text-green-600 flex items-center">
                                ✓ Збережено
                            </span>
                        )}
                    </div>

                    {/* Publish Status / Button */}
                    {data.status === 'PUBLISHED' ? (
                        <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md border border-green-200">
                            <span className="font-semibold mr-2">✅ Опубліковано</span>
                        </div>
                    ) : (
                        <Button onClick={handlePublish} disabled={isPublishing || isLoading}>
                            <Send className="h-4 w-4 mr-2" />
                            {isPublishing ? 'Публікація...' : 'Опублікувати'}
                        </Button>
                    )}

                    {/* Help Needed Indicator */}
                    {data.helpNeeded && (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-600" title="Потрібна допомога">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <BlockYesterday
                                tasks={data.yesterdayTasks}
                                metrics={data.yesterdayMetrics}
                                onTasksChange={(val) => handleChange('yesterdayTasks', val)}
                                onMetricsChange={(val) => handleChange('yesterdayMetrics', val)}
                            />

                            <BlockToday
                                plan={data.todayPlan}
                                onPlanChange={(val) => handleChange('todayPlan', val)}
                            />

                            <BlockHelp
                                help={data.helpNeeded}
                                onHelpChange={(val) => handleChange('helpNeeded', val)}
                            />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
