'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Bell } from 'lucide-react';
import wizardApi from '@/lib/wizardApi';
import { toast } from 'sonner';

interface PreferencesStepProps {
    onComplete: () => void;
}

export function PreferencesStep({ onComplete }: PreferencesStepProps) {
    const [preferences, setPreferences] = useState({
        workStart: '09:00',
        workEnd: '18:00',
        timezone: 'Europe/Kyiv',
        notifications: true,
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await wizardApi.patch('/user/preferences', preferences);
            toast.success('Preferences saved');
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-md mx-auto">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-medium">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h3>Work Schedule</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Select
                            value={preferences.workStart}
                            onValueChange={(v) => setPreferences({ ...preferences, workStart: v })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="08:00">08:00</SelectItem>
                                <SelectItem value="09:00">09:00</SelectItem>
                                <SelectItem value="10:00">10:00</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>End Time</Label>
                        <Select
                            value={preferences.workEnd}
                            onValueChange={(v) => setPreferences({ ...preferences, workEnd: v })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="17:00">17:00</SelectItem>
                                <SelectItem value="18:00">18:00</SelectItem>
                                <SelectItem value="19:00">19:00</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-medium">
                    <Bell className="w-5 h-5 text-purple-500" />
                    <h3>Notifications</h3>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div className="space-y-0.5">
                        <Label>Daily Digest</Label>
                        <p className="text-sm text-muted-foreground">Receive a daily summary of your tasks</p>
                    </div>
                    <Switch
                        checked={preferences.notifications}
                        onCheckedChange={(c) => setPreferences({ ...preferences, notifications: c })}
                    />
                </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Finish Setup'}
            </Button>
        </div>
    );
}
