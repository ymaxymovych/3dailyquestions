'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import AppLayout from '@/components/layout/AppLayout';
import TextEditor from '@/components/my-day/TextEditor';
import Timeline, { TimelineTask } from '@/components/my-day/Timeline';
import LoadStatusCard, { LoadCalculationResult } from '@/components/my-day/LoadStatusCard';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
// import { useDebounce } from '@/hooks/use-debounce'; // Removed as we use local implementation

// Simple debounce implementation if hook doesn't exist
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
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [planText, setPlanText] = useState<string>('');
    const [loadStatus, setLoadStatus] = useState<LoadCalculationResult | null>(null);
    const [initialContent, setInitialContent] = useState<string>('');

    const [tasks, setTasks] = useState<TimelineTask[]>([]);

    const formattedDate = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'EEEE, d MMMM', { locale: uk });

    const fetchPlan = useCallback(async () => {
        try {
            setIsLoading(true);
            const planResponse = await api.get(`/my-day/${formattedDate}`);
            setInitialContent(planResponse.data.rawText);
            setPlanText(planResponse.data.rawText);
            setTasks(planResponse.data.tasks || []);

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
        setPlanText(text); // Keep local state updated
        debouncedSave(text);
    };

    return (
        <AppLayout>
            <div className="h-full flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Мій день</h1>
                        <p className="text-muted-foreground capitalize">{displayDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            {isSaving ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Збереження...
                                </span>
                            ) : (
                                <span>Збережено</span>
                            )}
                        </div>
                        {/* Sync button placeholder */}
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Editor */}
                    <div className="w-3/5 border-r overflow-y-auto bg-background p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <TextEditor
                                initialContent={initialContent}
                                onChange={handleEditorChange}
                                className="min-h-[600px] shadow-sm"
                            />
                        )}
                    </div>

                    {/* Right Panel: Timeline */}
                    <div className="w-2/5 bg-muted/10 p-6 overflow-y-auto">
                        <Timeline date={date} tasks={tasks} className="min-h-[600px] border rounded-lg shadow-sm" />
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
