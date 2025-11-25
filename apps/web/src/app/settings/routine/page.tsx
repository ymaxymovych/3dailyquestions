'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getPreferences, updatePreferences, UserPreferences } from '@/lib/user-settings';
import { Loader2 } from 'lucide-react';

export default function RoutineSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, setValue, watch, reset } = useForm<UserPreferences>();

    // Watch switch values to handle them correctly with React Hook Form
    const isAutoBookFocus = watch('isAutoBookFocus');
    const privacyAggregatedOnly = watch('privacyAggregatedOnly');

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const prefs = await getPreferences();
            reset(prefs);
        } catch (error) {
            toast.error('Failed to load preferences');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: UserPreferences) => {
        setSaving(true);
        try {
            await updatePreferences(data);
            toast.success('Preferences updated');
        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Work Routine</CardTitle>
                    <CardDescription>
                        Configure your working hours and automation preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="workDayStart">Work Day Start</Label>
                                <Input type="time" id="workDayStart" {...register('workDayStart')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workDayEnd">Work Day End</Label>
                                <Input type="time" id="workDayEnd" {...register('workDayEnd')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                onValueChange={(val) => setValue('timezone', val)}
                                defaultValue={watch('timezone')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Europe/Kyiv">Europe/Kyiv (GMT+2/3)</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                                    {/* Add more as needed */}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Auto-book Focus Time</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically reserve 2-4 hours in your calendar for your "Big Task".
                                </p>
                            </div>
                            <Switch
                                checked={isAutoBookFocus}
                                onCheckedChange={(val) => setValue('isAutoBookFocus', val)}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Privacy Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Only show aggregated data to managers (hide specific task details).
                                </p>
                            </div>
                            <Switch
                                checked={privacyAggregatedOnly}
                                onCheckedChange={(val) => setValue('privacyAggregatedOnly', val)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
