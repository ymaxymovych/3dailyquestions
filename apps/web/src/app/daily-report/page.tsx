"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Send, AlertTriangle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getDailyReportByDate,
  createDailyReport,
  updateDailyReport,
  publishDailyReport,
  type CreateDailyReportDto,
  type SmallTasks,
  type BigTask,
  type MediumTask
} from '@/lib/daily-reports';
import { getProjects, type Project } from '@/lib/projects';
import { getTags, type Tag } from '@/lib/tags';
import { getCalendarEvents } from '@/lib/calendar';

interface DailyReportForm extends Omit<CreateDailyReportDto, 'yesterdaySmall' | 'todaySmall'> {
  yesterdaySmall?: SmallTasks;
  todaySmall?: SmallTasks;
  yesterdaySmallText?: string;
  todaySmallText?: string;
  // Removed structured metrics, using yesterdayNote and todayNote directly
}

export default function DailyReportPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get('date');
  const reportDate = dateParam || new Date().toISOString().split('T')[0];

  const [reportId, setReportId] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Ref to track the last saved state for dirty checking
  const lastSavedJson = useRef<string>('');

  const { register, watch, setValue, handleSubmit, getValues } = useForm<DailyReportForm>({
    defaultValues: {
      date: reportDate,
      yesterdayBig: [],
      yesterdayMedium: [],
      yesterdaySmallText: '',
      yesterdayNote: '', // Metrics Fact
      todayBig: [{ title: '', timeboxH: 3 }],
      todayMedium: [],
      todaySmallText: '',
      todayNote: '', // Metrics Plan
      helpRequests: [],
      mood: 3,
    },
  });

  const formData = watch();

  const handleDateChange = (days: number) => {
    const newDate = addDays(new Date(reportDate), days);
    const dateStr = format(newDate, 'yyyy-MM-dd');
    router.push(`/daily-report?date=${dateStr}`);
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    router.push(`/daily-report?date=${dateStr}`);
  };

  useEffect(() => {
    if (!user) return;

    // Load projects and tags
    Promise.all([getProjects(), getTags()])
      .then(([projectsRes, tagsRes]) => {
        setProjects(projectsRes.data);
        setTags(tagsRes.data);
      })
      .catch(() => {
        toast.error('Помилка завантаження проектів/тегів');
      });

    getDailyReportByDate(reportDate)
      .then((res) => {
        if (res.data) {
          setReportId(res.data.id);
          setReportStatus(res.data.status);
          setValue('yesterdayBig', res.data.yesterdayBig || []);
          setValue('yesterdayMedium', res.data.yesterdayMedium || []);

          // Load small tasks as text
          const yesterdayItems = res.data.yesterdaySmall?.items || [];
          setValue('yesterdaySmallText', yesterdayItems.join('\n'));
          setValue('yesterdayNote', res.data.yesterdayNote || '');

          setValue('todayBig', res.data.todayBig || [{ title: '', timeboxH: 3 }]);
          setValue('todayMedium', res.data.todayMedium || []);

          const todayItems = res.data.todaySmall?.items || [];
          setValue('todaySmallText', todayItems.join('\n'));
          setValue('todayNote', res.data.todayNote || '');

          setValue('mood', res.data.mood || 3);
          setValue('wellbeing', res.data.wellbeing);

          setValue('helpRequests', res.data.helpRequests || []);

          // Initialize lastSavedJson with the fetched data
          setTimeout(() => {
            lastSavedJson.current = JSON.stringify(getValues());
          }, 100);
        } else {
          // New report, reset state
          setReportId(null);
          setReportStatus('DRAFT');

          // Reset form to defaults
          setValue('yesterdayBig', []);
          setValue('yesterdayMedium', []);
          setValue('yesterdaySmallText', '');
          setValue('yesterdayNote', '');
          setValue('todayBig', [{ title: '', timeboxH: 3 }]);
          setValue('todayMedium', []);
          setValue('todaySmallText', '');
          setValue('todayNote', '');
          setValue('mood', 3);
          setValue('wellbeing', '');
          setValue('helpRequests', []);

          setTimeout(() => {
            lastSavedJson.current = JSON.stringify(getValues());
          }, 100);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user, setValue, reportDate, getValues]);

  const handleSave = useCallback(
    async (data: DailyReportForm, silent = false): Promise<string | null> => {
      try {
        // Transform form data to DTO
        const dto: CreateDailyReportDto = {
          ...data,
          yesterdaySmall: {
            items: data.yesterdaySmallText?.split('\n').filter(line => line.trim() !== '') || []
          },
          todaySmall: {
            items: data.todaySmallText?.split('\n').filter(line => line.trim() !== '') || []
          },
          helpRequests: data.helpRequests?.filter(req => req.text && req.text.trim() !== '') || [],
        };

        delete (dto as any).yesterdaySmallText;
        delete (dto as any).todaySmallText;

        let savedId = reportId;

        if (reportId) {
          await updateDailyReport(reportId, dto);
        } else {
          const res = await createDailyReport(dto);
          savedId = res.data.id;
          setReportId(savedId);
        }

        setLastSaved(new Date());
        lastSavedJson.current = JSON.stringify(data); // Update reference

        if (!silent) toast.success('Збережено');
        return savedId;
      } catch (error) {
        console.error(error);
        if (!silent) toast.error('Помилка збереження');
        return null;
      }
    },
    [reportId]
  );

  useEffect(() => {
    if (!user || loading) return;
    const timer = setInterval(() => {
      const currentJson = JSON.stringify(formData);
      if (currentJson !== lastSavedJson.current) {
        handleSave(formData, true);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [user, loading, formData, handleSave]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // 1. Force save first to ensure all changes are persisted
      const savedId = await handleSave(formData, true);

      if (!savedId) {
        toast.error('Не вдалося зберегти звіт перед публікацією');
        return;
      }

      // 2. Publish using the confirmed ID
      const res = await publishDailyReport(savedId);
      setReportStatus(res.data.status);
      toast.success('✅ Опубліковано');
    } catch (error: any) {
      console.error(error);
      toast.error('Помилка публікації');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    try {
      const res = await getCalendarEvents(reportDate);
      const events = res.data;

      if (events.length === 0) {
        toast.info('Подій не знайдено на цей день');
        return;
      }

      const newTasks = events.map(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const durationH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        return {
          title: event.summary,
          timeboxH: Math.round(durationH * 10) / 10, // Round to 1 decimal
        };
      });

      const currentMedium = getValues('todayMedium') || [];
      setValue('todayMedium', [...currentMedium, ...newTasks]);

      toast.success(`Імпортовано ${events.length} подій`);
    } catch (error) {
      console.error(error);
      toast.error('Помилка синхронізації з календарем. Перевірте підключення.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper to render task row with "More" menu
  const renderTaskRow = (
    tasks: (BigTask | MediumTask)[],
    field: 'yesterdayBig' | 'yesterdayMedium' | 'todayBig' | 'todayMedium',
    placeholder: string
  ) => {
    return tasks.map((task, index) => (
      <div key={index} className="flex flex-col gap-2 p-2 border rounded-md bg-white/50 hover:bg-white/80 transition-colors">
        <div className="flex gap-2 items-center">
          <Input
            value={task.title}
            onChange={(e) => {
              const newTasks = [...tasks];
              newTasks[index].title = e.target.value;
              setValue(field, newTasks as any);
            }}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0 font-medium"
          />
          <Input
            type="number"
            className="w-16 text-right border-0 bg-transparent focus-visible:ring-0"
            value={task.timeboxH}
            onChange={(e) => {
              const newTasks = [...tasks];
              newTasks[index].timeboxH = parseFloat(e.target.value) || 0;
              setValue(field, newTasks as any);
            }}
            placeholder="h"
          />

          {/* More Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Проект</Label>
                  <Select
                    value={task.project || "none"}
                    onValueChange={(v) => {
                      const newTasks = [...tasks];
                      newTasks[index].project = v === "none" ? undefined : v;
                      setValue(field, newTasks as any);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть проект" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без проекту</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Теги (через кому)</Label>
                  <Input
                    value={task.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[index].tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setValue(field, newTasks as any);
                    }}
                    placeholder="frontend, bugfix"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Delete Confirmation */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end">
              <div className="flex items-center gap-2">
                <span className="text-sm">Видалити?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 px-2"
                  onClick={() => {
                    const newTasks = tasks.filter((_, i) => i !== index);
                    setValue(field, newTasks as any);
                  }}
                >
                  Так
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Project/Tag Badges */}
        {(task.project || (task.tags && task.tags.length > 0)) && (
          <div className="flex gap-2 text-xs text-muted-foreground px-0">
            {task.project && (
              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                {projects.find(p => p.id === task.project)?.name || 'Project'}
              </span>
            )}
            {task.tags?.map(t => (
              <span key={t} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">#{t}</span>
            ))}
          </div>
        )}
      </div>
    ));
  };

  if (!user) return null;
  if (loading) return <AppLayout><p>Завантаження...</p></AppLayout>;

  const yesterdayBig = formData.yesterdayBig || [];
  const yesterdayMedium = formData.yesterdayMedium || [];
  const todayBig = formData.todayBig || [];
  const todayMedium = formData.todayMedium || [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !reportDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportDate ? format(new Date(reportDate), "PPP", { locale: uk }) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(reportDate)}
                    onSelect={(date) => date && handleDateSelect(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" onClick={() => handleDateChange(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {lastSaved && ` • Збережено: ${lastSaved.toLocaleTimeString()}`}
              {reportStatus === 'PUBLISHED' && ' • ✅ Опубліковано'}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Send className="h-4 w-4 mr-2" />
              {isPublishing ? 'Публікація...' : 'Опублікувати'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Yesterday's Report */}
          <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-900">A. Що я зробив учора</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Big Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-800 font-semibold">Велика справа (Main Focus)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    onClick={() => setValue('yesterdayBig', [...yesterdayBig, { title: '', timeboxH: 0 }])}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Додати
                  </Button>
                </div>
                {renderTaskRow(yesterdayBig, 'yesterdayBig', "Що саме зроблено?")}
              </div>

              {/* Medium Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-800 font-semibold">Інші важливі справи</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    onClick={() => setValue('yesterdayMedium', [...yesterdayMedium, { title: '', timeboxH: 0 }])}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Додати
                  </Button>
                </div>
                {renderTaskRow(yesterdayMedium, 'yesterdayMedium', "Справа")}
              </div>

              {/* Small Tasks */}
              <div className="space-y-2">
                <Label className="text-blue-800 font-semibold">Дріб'язок (списком)</Label>
                <Textarea
                  {...register('yesterdaySmallText')}
                  placeholder="- відповів на листи&#10;- заповнив звіт"
                  className="min-h-[100px] bg-white/50 border-blue-200 focus:border-blue-400"
                />
              </div>

              {/* Metrics Fact */}
              <div className="space-y-2 pt-2 border-t border-blue-200">
                <Label className="text-blue-800 font-semibold">Метрики / KPI (Факт)</Label>
                <Textarea
                  {...register('yesterdayNote')}
                  placeholder="Наприклад:&#10;Дзвінків: 15&#10;Лідів: 3"
                  className="min-h-[60px] bg-white/50 border-blue-200 focus:border-blue-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Plan */}
          <Card className="bg-green-50/50 border-green-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-green-900">B. План на сьогодні</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSyncCalendar} disabled={isSyncing} className="h-7 bg-white/50 border-green-200 hover:bg-green-100">
                <CalendarIcon className="h-3 w-3 mr-2" />
                {isSyncing ? '...' : 'З календаря'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Big Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-green-800 font-semibold">Головний фокус (1 справа)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                    onClick={() => setValue('todayBig', [...todayBig, { title: '', timeboxH: 3 }])}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Додати
                  </Button>
                </div>
                {renderTaskRow(todayBig, 'todayBig', "Найважливіша справа")}
              </div>

              {/* Medium Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-green-800 font-semibold">Інші справи (2-3 шт)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                    onClick={() => setValue('todayMedium', [...todayMedium, { title: '', timeboxH: 1 }])}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Додати
                  </Button>
                </div>
                {renderTaskRow(todayMedium, 'todayMedium', "Справа")}
              </div>

              {/* Small Tasks */}
              <div className="space-y-2">
                <Label className="text-green-800 font-semibold">Дріб'язок / Рутина</Label>
                <Textarea
                  {...register('todaySmallText')}
                  placeholder="- зустріч о 14:00&#10;- оплатити рахунки"
                  className="min-h-[100px] bg-white/50 border-green-200 focus:border-green-400"
                />
              </div>

              {/* Metrics Plan */}
              <div className="space-y-2 pt-2 border-t border-green-200">
                <Label className="text-green-800 font-semibold">Метрики / KPI (План)</Label>
                <Textarea
                  {...register('todayNote')}
                  placeholder="Наприклад:&#10;План дзвінків: 20"
                  className="min-h-[60px] bg-white/50 border-green-200 focus:border-green-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wellbeing Card */}
        <Card className="bg-purple-50/50 border-purple-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-900">C. Самопочуття та Блокери</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-purple-800 font-semibold">Настрій / Енергія (1-5)</Label>
                <Select
                  value={String(formData.mood)}
                  onValueChange={(v) => setValue('mood', parseInt(v))}
                >
                  <SelectTrigger className="bg-white/50 border-purple-200">
                    <SelectValue placeholder="Оберіть..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Жахливо 😫</SelectItem>
                    <SelectItem value="2">2 - Так собі 😕</SelectItem>
                    <SelectItem value="3">3 - Нормально 😐</SelectItem>
                    <SelectItem value="4">4 - Добре 🙂</SelectItem>
                    <SelectItem value="5">5 - Чудово 🤩</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-purple-800 font-semibold">Нотатки про самопочуття</Label>
                <Textarea
                  {...register('wellbeing')}
                  placeholder="Як спалося? Чи є стрес?"
                  className="bg-white/50 border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-purple-800 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Потрібна допомога / Блокери
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  onClick={() => setValue('helpRequests', [...(formData.helpRequests || []), { text: '', context: '' }])}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Додати
                </Button>
              </div>
              {(formData.helpRequests || []).map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={req.text}
                    onChange={(e) => {
                      const newReqs = [...(formData.helpRequests || [])];
                      newReqs[index].text = e.target.value;
                      setValue('helpRequests', newReqs);
                    }}
                    placeholder="У чому проблема?"
                    className="flex-1 bg-white/50 border-purple-200"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:text-red-500">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Видалити?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2"
                          onClick={() => {
                            const updated = (formData.helpRequests || []).filter((_, i) => i !== index);
                            setValue('helpRequests', updated);
                          }}
                        >
                          Так
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}