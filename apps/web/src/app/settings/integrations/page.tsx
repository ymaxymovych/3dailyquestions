'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getIntegrations, updateIntegration, Integration } from '@/lib/user-settings';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrationsSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            const data = await getIntegrations();
            setIntegrations(data);
        } catch (error) {
            toast.error('Failed to load integrations');
        } finally {
            setLoading(false);
        }
    };

    const getIntegration = (type: string) => integrations.find(i => i.type === type);

    const handleSave = async (type: string, data: any) => {
        setSaving(type);
        try {
            await updateIntegration({ type, ...data });
            toast.success(`${type} settings saved`);
            loadIntegrations();
        } catch (error) {
            toast.error(`Failed to save ${type} settings`);
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Yaware */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Yaware Timetracker
                        {getIntegration('YAWARE')?.isEnabled && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>
                        Connect Yaware to automatically track your time and software usage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={getIntegration('YAWARE')?.isEnabled || false}
                            onCheckedChange={(val) => handleSave('YAWARE', { isEnabled: val })}
                        />
                        <Label>Enable Integration</Label>
                    </div>
                    <div className="grid gap-2">
                        <Label>API Key</Label>
                        <div className="flex gap-2">
                            <Input type="password" placeholder="Enter your Yaware API Key" />
                            <Button
                                variant="outline"
                                onClick={() => handleSave('YAWARE', { credentials: { apiKey: 'dummy' } })} // Placeholder logic
                                disabled={saving === 'YAWARE'}
                            >
                                Save Key
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your key is stored securely.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Google Calendar
                        {getIntegration('CALENDAR')?.isEnabled && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>
                        Sync your calendar events to your daily report and auto-book focus time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={getIntegration('CALENDAR')?.isEnabled || false}
                            onCheckedChange={(val) => handleSave('CALENDAR', { isEnabled: val })}
                        />
                        <Label>Enable Integration</Label>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/google`;
                        }}
                    >
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Connect Google Account
                    </Button>
                </CardContent>
            </Card>

            {/* Gmail */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Gmail
                        {getIntegration('GMAIL')?.isEnabled && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>
                        Analyze email activity to suggest tasks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={getIntegration('GMAIL')?.isEnabled || false}
                            onCheckedChange={(val) => handleSave('GMAIL', { isEnabled: val })}
                        />
                        <Label>Enable Integration</Label>
                    </div>
                    <Button variant="outline" disabled>
                        Connect Gmail Account (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
