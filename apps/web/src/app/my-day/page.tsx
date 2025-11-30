'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import TextEditor from '@/components/my-day/TextEditor';
import Timeline, { TimelineTask } from '@/components/my-day/Timeline';
import LoadStatusCard, { LoadCalculationResult } from '@/components/my-day/LoadStatusCard';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function useDebounceCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    return useCallback((...args: Parameters<T>) => {
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => {
            callback(...args);
        }, delay);
        setTimer(newTimer);
    }, [callback, delay, timer]);
}

export default function MyDayPage() {
    const router = useRouter();
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [planText, setPlanText] = useState<string>('');
    const [loadStatus, setLoadStatus] = useState<LoadCalculationResult | null>(null);
    const [initialContent, setInitialContent] = useState<string>('');
    const [tasks, setTasks] = useState<TimelineTask[]>([]);

    const formattedDate = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'EEEE, d MMMM', { locale: uk });

    const handleDateChange = (days: number) => {
        const newDate = addDays(date, days);
        setDate(newDate);
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const fetchPlan = useCallback(async () => {
        try {
            setIsLoading(true);
            const planResponse = await api.get(`/my-day/${formattedDate}`);
            setInitialContent(planResponse.data.rawText);
            setPlanText(planResponse.data.rawText);
            setTasks(planResponse.data.tasks || []);
            setHasUnsavedChanges(false);

            // Also fetch load status
            const loadResponse = await api.get(`/my-day/${formattedDate}/load-status`);
            setLoadStatus(loadResponse.data);
        } catch (error) {
            console.error('Failed to fetch plan:', error);
            toast.error('Не вдалося завантажити план');
        } finally {
            setIsLoading(false);
        }
    }, [formattedDate]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    const savePlan = async (text: string) => {
        try {
            setIsSaving(true);
            const response = await api.put(`/my-day/${formattedDate}`, { text });
            setTasks(response.data.tasks || []);
            setHasUnsavedChanges(false);

            // Refresh load status after save
            const loadResponse = await api.get(`/my-day/${formattedDate}/load-status`);
            setLoadStatus(loadResponse.data);
        } catch (error) {
            console.error('Failed to save plan:', error);
            toast.error('Не вдалося зберегти зміни');
        } finally {
            setIsSaving(false);
        }
    };

    const debouncedSave = useDebounceCallback(savePlan, 3000);

    const handleEditorChange = (html: string, text: string) => {
        setPlanText(text);
        setHasUnsavedChanges(true);
        debouncedSave(text);
    };

    return (
        <AppLayout>
            <div className="h-full flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Мій день</h1>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-1 mt-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {displayDate}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" onClick={() => handleDateChange(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            {isSaving ? (
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Збереження...
                                </span>
                            ) : hasUnsavedChanges ? (
                                <span className="text-muted-foreground">Не збережено</span>
                            ) : (
                                <span className="text-green-600 font-medium">✓ Збережено</span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Instructions */}
                <div className="px-6 py-3 bg-muted/30 border-b text-sm text-muted-foreground">
                    <p className="mb-1">
                        <strong>Опишіть, над чим працюєте сьогодні.</strong> Час вказуйте в дужках, наприклад: (45 хв) або (10:00–13:00), якщо хочете забронювати точний проміжок часу.
                    </p>
                    <p className="text-xs">
                        <strong>Порада для Великої справи:</strong> Що зміниться в компанії після того, як ви це зробите? Опишіть результат, а не процес. Використовуйте цифри, якщо це можливо.
                    </p>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Editor (80%) */}
                    <div className="w-4/5 border-r overflow-y-auto bg-background p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <TextEditor
                                initialContent={initialContent}
                                onChange={handleEditorChange}
                                className="min-h-[600px]"
                            />
                        )}
                    </div>

                    {/* Right Panel: Timeline (20%) */}
                    <div className="w-1/5 bg-muted/10 p-4 overflow-y-auto">
                        <Timeline date={date} tasks={tasks} className="min-h-[600px]" />
                    </div>
                </div>

                {/* Bottom Panel: Load Status */}
                <div className="border-t bg-background p-4">
                    <LoadStatusCard load={loadStatus} />
                </div>
            </div>
        </AppLayout>
    );
}
