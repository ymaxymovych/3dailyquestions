"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
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
  publishDailyReport,
  type CreateDailyReportDto,
} from '@/lib/daily-reports';

export default function DailyReportPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const reportDate = dateParam || new Date().toISOString().split('T')[0];

  const [reportId, setReportId] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, watch, setValue, handleSubmit } = useForm<CreateDailyReportDto>({
    defaultValues: {
      date: reportDate,
      yesterdayBig: [],
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

  useEffect(() => {
    if (!user) return;
    getDailyReportByDate(reportDate)
      .then((res) => {
        if (res.data) {
          setReportId(res.data.id);
          setReportStatus(res.data.status);
          setValue('yesterdayBig', res.data.yesterdayBig || []);
          setValue('yesterdayMedium', res.data.yesterdayMedium || []);
          setValue('yesterdaySmall', res.data.yesterdaySmall || { count: 0 });
          setValue('todayBig', res.data.todayBig || [{ title: '' }]);
          setValue('todayMedium', res.data.todayMedium || []);
          setValue('todaySmall', res.data.todaySmall || { count: 0 });
          setValue('mood', res.data.mood || 3);
          setValue('wellbeing', res.data.wellbeing);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user, setValue, reportDate]);

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
    if (!reportId) {
      toast.error('Спочатку збережіть звіт');
      return;
    }
    setIsPublishing(true);
    try {
      const res = await publishDailyReport(reportId);
      setReportStatus(res.data.status);
      toast.success('✅ Опубліковано');
    } catch (error: any) {
      console.error(error);
      toast.error('Помилка публікації');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!user) return null;
  if (loading) return <AppLayout><p>Завантаження...</p></AppLayout>;

  const yesterdayBig = formData.yesterdayBig || [];
  const yesterdayMedium = formData.yesterdayMedium || [];
  const todayBig = formData.todayBig || [];
  const todayMedium = formData.todayMedium || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Щоденний план і звіт</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(reportDate).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
              {lastSaved && ` • Збережено: ${lastSaved.toLocaleTimeString()}`}
              {reportStatus === 'PUBLISHED' && ' • ✅ Опубліковано'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit((data) => handleSave(data))} variant="outline" disabled={isPublishing}>
              <Save className="h-4 w-4 mr-2" />
              Зберегти
            </Button>
            <Button onClick={handlePublish} disabled={reportStatus === 'PUBLISHED' || isPublishing}>
              <Send className="h-4 w-4 mr-2" />
              {reportStatus === 'PUBLISHED' ? 'Опубліковано' : isPublishing ? 'Публікація...' : 'Опублікувати'}
            </Button>
          </div>
        </div>

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
      </div>
    </AppLayout>
  );
}