'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Save, Check, CalendarDays, Plug, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/components/layout/AppLayout';

// New Components
import { YesterdayCard } from '@/components/my-day/YesterdayCard';
import { TodayCard } from '@/components/my-day/TodayCard';
import { HelpCard } from '@/components/my-day/HelpCard';
import { ContextPanel } from '@/components/my-day/ContextPanel';
import { AIMentorCard } from '@/components/my-day/AIMentorCard';
import { DailyReportState, Task, TaskStatus } from '@/components/my-day/types';
import { INITIAL_STATE } from '@/components/my-day/constants';
import { VoiceInput } from '@/components/my-day/VoiceInput';
import { parseDailyReport } from '@/lib/mockAIParser';

// Types for API response
interface ThreeBlocksData {
    id?: string;
    date: string;
    yesterdayTasks: string; // JSON string (DailyReportState.yesterday)
    yesterdayMetrics: string; // Legacy field, now part of yesterdayTasks JSON
    todayPlan: string; // JSON string (DailyReportState.today)
    helpNeeded: string; // JSON string (DailyReportState.help)
    status: 'DRAFT' | 'PUBLISHED';
}

export default function ThreeBlocksPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [reportState, setReportState] = useState<DailyReportState>(INITIAL_STATE);
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showMobileContext, setShowMobileContext] = useState(false);
    const [hasIntegrations, setHasIntegrations] = useState(true);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const response = await axios.get(`${apiUrl}/my-day/${date.toISOString()}`);
                const data: ThreeBlocksData = response.data;

                // Parse JSON fields
                let parsedState = { ...INITIAL_STATE };

                if (data.yesterdayTasks) {
                    try {
                        const parsed = JSON.parse(data.yesterdayTasks);
                        // Check if it's the new format (has plannedTasks) or old format (StructuredTasks)
                        if (Array.isArray(parsed.plannedTasks)) {
                            parsedState.yesterday = parsed;
                        } else {
                            // Migration from old format (StructuredTasks) to new format
                            // We can't easily convert text to tasks, so we put it in summary or unplanned
                            parsedState.yesterday.summary = parsed.mediumTasks || '';
                        }
                    } catch (e) {
                        // Legacy plain text
                        parsedState.yesterday.summary = data.yesterdayTasks;
                    }
                }

                // If yesterdayTasks is empty, try to fetch "Smart Carry-over" from previous day's Today Plan
                if (!data.yesterdayTasks || data.yesterdayTasks === '{}') {
                    try {
                        const prevDate = subDays(date, 1);
                        const prevResponse = await axios.get(`${apiUrl}/my-day/${prevDate.toISOString()}`);
                        const prevData: ThreeBlocksData = prevResponse.data;

                        if (prevData.todayPlan) {
                            const prevToday = JSON.parse(prevData.todayPlan);
                            // Convert prev today plan to yesterday tasks
                            const carriedTasks: Task[] = [];

                            if (prevToday.bigTask) {
                                carriedTasks.push({
                                    id: 'big-task',
                                    title: prevToday.bigTask,
                                    type: 'Big',
                                    timeEstimate: prevToday.bigTaskTime,
                                    status: 'partial' // Default status
                                });
                            }

                            // Parse medium tasks (assuming they are separated by newlines)
                            if (prevToday.mediumTasks) {
                                prevToday.mediumTasks.split('\n').forEach((line: string, idx: number) => {
                                    if (line.trim()) {
                                        carriedTasks.push({
                                            id: `med-task-${idx}`,
                                            title: line.replace(/^[•\-\*]\s*/, ''), // Remove bullets
                                            type: 'Medium',
                                            status: 'partial'
                                        });
                                    }
                                });
                            }

                            if (carriedTasks.length > 0) {
                                parsedState.yesterday.plannedTasks = carriedTasks;
                            }
                        }
                    } catch (e) {
                        console.log('No previous day data for carry-over');
                    }
                }

                if (data.todayPlan) {
                    try {
                        const parsed = JSON.parse(data.todayPlan);
                        parsedState.today = { ...INITIAL_STATE.today, ...parsed };
                    } catch (e) {
                        // Legacy plain text fallback
                    }
                }

                if (data.helpNeeded) {
                    try {
                        const parsed = JSON.parse(data.helpNeeded);
                        parsedState.help = { ...INITIAL_STATE.help, ...parsed };
                    } catch (e) {
                        parsedState.help.blockers = data.helpNeeded;
                    }
                }

                setReportState(parsedState);
                setStatus(data.status);
                setHasUnsavedChanges(false);

            } catch (error) {
                // 404 - No data
                // FOR DEMO: Use INITIAL_STATE if no data found
                setReportState(INITIAL_STATE);
                setStatus('DRAFT');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [date]);

    // Auto-save
    const saveData = useCallback(async (currentState: DailyReportState) => {
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            await axios.put(`${apiUrl}/my-day/${date.toISOString()}`, {
                yesterdayTasks: JSON.stringify(currentState.yesterday),
                yesterdayMetrics: '', // Deprecated, stored in JSON
                todayPlan: JSON.stringify(currentState.today),
                helpNeeded: JSON.stringify(currentState.help)
            });
            setHasUnsavedChanges(false);
        } catch (error) {
            toast.error('Помилка збереження');
        } finally {
            setIsSaving(false);
        }
    }, [date]);

    const debouncedSave = useDebounce((newState: DailyReportState) => {
        saveData(newState);
    }, 3000);

    const updateState = (newState: DailyReportState) => {
        setReportState(newState);
        setHasUnsavedChanges(true);
        debouncedSave(newState);
    };

    // Handlers for YesterdayCard
    const handleTaskStatusChange = (id: string, status: TaskStatus) => {
        const newState = {
            ...reportState,
            yesterday: {
                ...reportState.yesterday,
                plannedTasks: reportState.yesterday.plannedTasks.map(t =>
                    t.id === id ? { ...t, status } : t
                )
            }
        };
        updateState(newState);
    };

    const handleTaskCommentChange = (id: string, comment: string) => {
        const newState = {
            ...reportState,
            yesterday: {
                ...reportState.yesterday,
                plannedTasks: reportState.yesterday.plannedTasks.map(t =>
                    t.id === id ? { ...t, comment } : t
                )
            }
        };
        updateState(newState);
    };

    const handleTaskTitleChange = (id: string, title: string) => {
        const newState = {
            ...reportState,
            yesterday: {
                ...reportState.yesterday,
                plannedTasks: reportState.yesterday.plannedTasks.map(t =>
                    t.id === id ? { ...t, title } : t
                )
            }
        };
        updateState(newState);
    };

    const updateYesterdayField = (field: 'unplannedWork' | 'summary' | 'smallTasks' | 'metrics', value: string) => {
        const newState = {
            ...reportState,
            yesterday: { ...reportState.yesterday, [field]: value }
        };
        updateState(newState);
    };

    const handleAddTask = () => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: '',
            type: 'Medium',
            status: 'done',
            comment: ''
        };

        const newState = {
            ...reportState,
            yesterday: {
                ...reportState.yesterday,
                plannedTasks: [...reportState.yesterday.plannedTasks, newTask]
            }
        };
        updateState(newState);
    };

    const handleDeleteTask = (id: string) => {
        const newState = {
            ...reportState,
            yesterday: {
                ...reportState.yesterday,
                plannedTasks: reportState.yesterday.plannedTasks.filter(t => t.id !== id)
            }
        };
        updateState(newState);
        toast.success('Задачу видалено');
    };

    // Handlers for TodayCard
    const updateTodayField = (field: string, value: string | boolean) => {
        const newState = {
            ...reportState,
            today: { ...reportState.today, [field]: value }
        };
        updateState(newState);
    };

    // Handlers for HelpCard
    const updateHelpField = (value: string) => {
        const newState = {
            ...reportState,
            help: { ...reportState.help, blockers: value }
        };
        updateState(newState);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            await saveData(reportState);
            await axios.post(`${apiUrl}/my-day/${date.toISOString()}/publish`);
            setStatus('PUBLISHED');
            toast.success('✅ Опубліковано');
        } catch (error) {
            toast.error('Не вдалося опублікувати');
        } finally {
            setIsPublishing(false);
        }
    };

    const changeDate = (days: number) => {
        if (hasUnsavedChanges) {
            saveData(reportState);
        }
        setDate(prev => addDays(prev, days));
    };

    const handleVoiceInput = (transcript: string) => {
        const parsed = parseDailyReport(transcript);

        // Save previous state for Undo
        const previousState = { ...reportState };

        // Smart Merge Logic
        const newState = { ...reportState };
        let hasChanges = false;

        // Helper to check for duplicates
        const isDuplicateTask = (tasks: Task[], title: string) => {
            return tasks.some(t => t.title.toLowerCase().trim() === title.toLowerCase().trim());
        };

        // 1. Yesterday: Append Tasks
        if (parsed.yesterday) {
            if (parsed.yesterday.plannedTasks?.length) {
                const newTasks = parsed.yesterday.plannedTasks.filter(t => !isDuplicateTask(newState.yesterday.plannedTasks, t.title));
                if (newTasks.length > 0) {
                    newState.yesterday.plannedTasks = [
                        ...newState.yesterday.plannedTasks,
                        ...newTasks
                    ];
                    hasChanges = true;
                }
            }
            // Append text fields with newline
            if (parsed.yesterday.summary && !newState.yesterday.summary.includes(parsed.yesterday.summary)) {
                newState.yesterday.summary = newState.yesterday.summary
                    ? `${newState.yesterday.summary}\n${parsed.yesterday.summary}`
                    : parsed.yesterday.summary;
                hasChanges = true;
            }
            if (parsed.yesterday.unplannedWork && !newState.yesterday.unplannedWork.includes(parsed.yesterday.unplannedWork)) {
                newState.yesterday.unplannedWork = newState.yesterday.unplannedWork
                    ? `${newState.yesterday.unplannedWork}\n${parsed.yesterday.unplannedWork}`
                    : parsed.yesterday.unplannedWork;
                hasChanges = true;
            }
        }

        // 2. Today: Smart Merge with Big Task Displacement
        if (parsed.today) {
            // Big Task Displacement Strategy
            if (parsed.today.bigTask) {
                // Check if it's the same task
                if (newState.today.bigTask !== parsed.today.bigTask) {
                    if (newState.today.bigTask) {
                        const oldBigTask = newState.today.bigTask;
                        const oldBigTaskTime = newState.today.bigTaskTime ? ` (${newState.today.bigTaskTime})` : '';

                        // Move old big task to medium tasks
                        const movedTask = `[Moved from Big Task] ${oldBigTask}${oldBigTaskTime}`;
                        newState.today.mediumTasks = newState.today.mediumTasks
                            ? `${newState.today.mediumTasks}\n${movedTask}`
                            : movedTask;
                    }

                    newState.today.bigTask = parsed.today.bigTask;
                    newState.today.bigTaskTime = parsed.today.bigTaskTime || '';
                    hasChanges = true;
                }
            }

            // Append Medium Tasks
            if (parsed.today.mediumTasks && !newState.today.mediumTasks?.includes(parsed.today.mediumTasks)) {
                newState.today.mediumTasks = newState.today.mediumTasks
                    ? `${newState.today.mediumTasks}\n${parsed.today.mediumTasks}`
                    : parsed.today.mediumTasks;
                hasChanges = true;
            }
        }

        // 3. Help: Append Blockers
        if (parsed.help) {
            if (parsed.help.blockers && !newState.help.blockers.includes(parsed.help.blockers)) {
                newState.help.blockers = newState.help.blockers
                    ? `${newState.help.blockers}\n${parsed.help.blockers}`
                    : parsed.help.blockers;
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            toast.info('Нової інформації не знайдено або вона вже існує.');
            return;
        }

        updateState(newState);

        // Custom Toast based on action with UNDO
        const toastMessage = (parsed.yesterday?.unplannedWork || parsed.today?.mediumTasks?.includes('Додатково'))
            ? 'Звіт доповнено новою інформацією!'
            : 'Звіт заповнено з голосу!';

        toast.success(toastMessage, {
            action: {
                label: 'Undo',
                onClick: () => {
                    setReportState(previousState);
                    updateState(previousState);
                    toast.info('Зміни скасовано');
                }
            },
            duration: 5000,
        });
    };

    return (
        <AppLayout>
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
                {/* Header */}
                <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                                <CalendarDays className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Щоденний звіт</h1>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <button onClick={() => changeDate(-1)} className="hover:text-blue-600 transition-colors">
                                        <ChevronLeft className="w-3 h-3" />
                                    </button>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="hover:text-blue-600 transition-colors">
                                                {format(date, "EEEE, d MMMM", { locale: uk })}
                                            </button>
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

                                    <button onClick={() => changeDate(1)} className="hover:text-blue-600 transition-colors">
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setHasIntegrations(!hasIntegrations)}
                                className="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800"
                                title="Toggle Integration State (Demo)"
                            >
                                <Plug className="w-3 h-3" />
                                {hasIntegrations ? 'Linked' : 'Unlinked'}
                            </button>

                            <button
                                className="lg:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                                onClick={() => setShowMobileContext(!showMobileContext)}
                            >
                                <Menu className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-900"></span>
                            </button>

                            <button
                                onClick={handlePublish}
                                disabled={isSaving || isPublishing}
                                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95
                                    ${status === 'PUBLISHED'
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                `}
                            >
                                {isSaving || isPublishing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : status === 'PUBLISHED' ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Опубліковано</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Зберегти та відправити</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <main className="h-full max-w-7xl mx-auto px-4 sm:px-6 py-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">

                            {/* Left Column: Report Form (66%) */}
                            <div className="lg:col-span-8 space-y-8">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <>
                                        <YesterdayCard
                                            tasks={reportState.yesterday.plannedTasks}
                                            unplannedWork={reportState.yesterday.unplannedWork}
                                            smallTasks={reportState.yesterday.smallTasks}
                                            summary={reportState.yesterday.summary}
                                            metrics={reportState.yesterday.metrics}
                                            onTaskStatusChange={handleTaskStatusChange}
                                            onTaskCommentChange={handleTaskCommentChange}
                                            onTaskTitleChange={handleTaskTitleChange}
                                            onAddTask={handleAddTask}
                                            onUnplannedChange={(v) => updateYesterdayField('unplannedWork', v)}
                                            onSmallTasksChange={(v) => updateYesterdayField('smallTasks', v)}
                                            onSummaryChange={(v) => updateYesterdayField('summary', v)}
                                            onMetricsChange={(v) => updateYesterdayField('metrics', v)}
                                            onDeleteTask={handleDeleteTask}
                                        />

                                        <TodayCard
                                            {...reportState.today}
                                            onChange={updateTodayField}
                                        />

                                        <HelpCard
                                            blockers={reportState.help.blockers}
                                            onChange={updateHelpField}
                                        />

                                        {/* Mobile Save Button */}
                                        <div className="sm:hidden sticky bottom-4 z-20">
                                            <button
                                                onClick={handlePublish}
                                                disabled={isSaving}
                                                className={`w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-colors
                                              ${status === 'PUBLISHED'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-blue-600 text-white'}
                                            `}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : status === 'PUBLISHED' ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <Save className="w-5 h-5" />
                                                )}
                                                <span>{status === 'PUBLISHED' ? 'Опубліковано' : 'Зберегти та відправити'}</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                            </div>

                            {/* Right Column: Context Panel (33%) */}
                            <div className={`
                              lg:col-span-4 lg:block
                              ${showMobileContext ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 overflow-y-auto' : 'hidden'}
                           `}>
                                {showMobileContext && (
                                    <div className="flex justify-between items-center mb-6 lg:hidden">
                                        <h2 className="text-xl font-bold dark:text-white">Контекст</h2>
                                        <button onClick={() => setShowMobileContext(false)} className="text-slate-500">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                )}

                                {/* AI Mentor Card - Desktop only */}
                                <div className="hidden lg:block mb-6">
                                    <AIMentorCard userId={''} date={date} />
                                </div>

                                <ContextPanel
                                    isMobile={showMobileContext}
                                    hasIntegrations={hasIntegrations}
                                    onConnect={() => setHasIntegrations(true)}
                                    todayBigTask={reportState.today.bigTask}
                                    todayBigTaskTime={reportState.today.bigTaskTime}
                                    isBigTaskBooked={reportState.today.isBigTaskBooked}
                                />
                            </div>

                        </div>
                    </main>
                </div>

                {/* Voice Input FAB */}
                <VoiceInput onTranscript={handleVoiceInput} />
            </div>
        </AppLayout >
    );
}


