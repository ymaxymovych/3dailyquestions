'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Building2, Clock, Brain, Save } from 'lucide-react';

interface OrganizationSettings {
    timezone?: string;
    workDays?: string[];
    workHours?: {
        start: string;
        end: string;
    };
}

interface AIPolicySettings {
    tone?: 'formal' | 'casual' | 'balanced';
    frequency?: 'daily' | 'weekly' | 'on-demand';
    enabled?: boolean;
}

interface Organization {
    id: string;
    name: string;
    slug: string;
    domains: string[];
    settings: OrganizationSettings | null;
    aiPolicy: AIPolicySettings | null;
    plan: string;
    status: string;
    maxUsers: number;
    _count: {
        users: number;
        departments: number;
    };
}

const TIMEZONES = [
    'UTC',
    'Europe/Kiev',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
];

const WEEKDAYS = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
];

export default function CompanySettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [timezone, setTimezone] = useState('UTC');
    const [workDays, setWorkDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
    const [workHoursStart, setWorkHoursStart] = useState('09:00');
    const [workHoursEnd, setWorkHoursEnd] = useState('18:00');
    const [aiEnabled, setAiEnabled] = useState(true);
    const [aiTone, setAiTone] = useState<'formal' | 'casual' | 'balanced'>('balanced');
    const [aiFrequency, setAiFrequency] = useState<'daily' | 'weekly' | 'on-demand'>('daily');

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            const response = await fetch('/api/organization');
            if (response.ok) {
                const data: Organization = await response.json();
                setOrganization(data);

                // Populate form
                setCompanyName(data.name);
                setTimezone(data.settings?.timezone || 'UTC');
                setWorkDays(data.settings?.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
                setWorkHoursStart(data.settings?.workHours?.start || '09:00');
                setWorkHoursEnd(data.settings?.workHours?.end || '18:00');
                setAiEnabled(data.aiPolicy?.enabled ?? true);
                setAiTone(data.aiPolicy?.tone || 'balanced');
                setAiFrequency(data.aiPolicy?.frequency || 'daily');
            }
        } catch (error) {
            console.error('Failed to fetch organization:', error);
            toast({
                title: 'Error',
                description: 'Failed to load company settings',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/organization', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: companyName,
                    settings: {
                        timezone,
                        workDays,
                        workHours: {
                            start: workHoursStart,
                            end: workHoursEnd,
                        },
                    },
                    aiPolicy: {
                        enabled: aiEnabled,
                        tone: aiTone,
                        frequency: aiFrequency,
                    },
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Company settings saved successfully',
                });
                fetchOrganization();
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Failed to save organization:', error);
            toast({
                title: 'Error',
                description: 'Failed to save company settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleWorkDay = (day: string) => {
        setWorkDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading company settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Company Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Configure your organization's basic information and work schedule.
                </p>
            </div>

            {/* Company Basics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Company Information
                    </CardTitle>
                    <CardDescription>
                        Basic details about your organization
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Acme Corporation"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger id="timezone">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map((tz) => (
                                    <SelectItem key={tz} value={tz}>
                                        {tz}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {organization && (
                        <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-muted-foreground">
                            <div>
                                <div className="font-medium text-foreground">Plan</div>
                                <div className="capitalize">{organization.plan}</div>
                            </div>
                            <div>
                                <div className="font-medium text-foreground">Status</div>
                                <div className="capitalize">{organization.status}</div>
                            </div>
                            <div>
                                <div className="font-medium text-foreground">Users</div>
                                <div>{organization._count.users} / {organization.maxUsers}</div>
                            </div>
                            <div>
                                <div className="font-medium text-foreground">Departments</div>
                                <div>{organization._count.departments}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Work Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Work Schedule
                    </CardTitle>
                    <CardDescription>
                        Define your standard work week and hours
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="mb-3 block">Work Days</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {WEEKDAYS.map((day) => (
                                <div
                                    key={day.value}
                                    className="flex items-center space-x-2"
                                >
                                    <Switch
                                        id={day.value}
                                        checked={workDays.includes(day.value)}
                                        onCheckedChange={() => toggleWorkDay(day.value)}
                                    />
                                    <Label htmlFor={day.value} className="cursor-pointer">
                                        {day.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="workHoursStart">Work Start Time</Label>
                            <Input
                                id="workHoursStart"
                                type="time"
                                value={workHoursStart}
                                onChange={(e) => setWorkHoursStart(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="workHoursEnd">Work End Time</Label>
                            <Input
                                id="workHoursEnd"
                                type="time"
                                value={workHoursEnd}
                                onChange={(e) => setWorkHoursEnd(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Policy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Advisory Board Policy
                    </CardTitle>
                    <CardDescription>
                        Configure how AI features interact with your team
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="aiEnabled">Enable AI Features</Label>
                            <div className="text-sm text-muted-foreground">
                                Turn on AI Mentor, Manager Digest, and Task Structurizer
                            </div>
                        </div>
                        <Switch
                            id="aiEnabled"
                            checked={aiEnabled}
                            onCheckedChange={setAiEnabled}
                        />
                    </div>

                    {aiEnabled && (
                        <>
                            <Separator />

                            <div className="grid gap-2">
                                <Label htmlFor="aiTone">AI Communication Tone</Label>
                                <Select value={aiTone} onValueChange={(v) => setAiTone(v as any)}>
                                    <SelectTrigger id="aiTone">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="formal">Formal - Professional and structured</SelectItem>
                                        <SelectItem value="balanced">Balanced - Friendly yet professional</SelectItem>
                                        <SelectItem value="casual">Casual - Conversational and relaxed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="aiFrequency">AI Advisory Frequency</Label>
                                <Select value={aiFrequency} onValueChange={(v) => setAiFrequency(v as any)}>
                                    <SelectTrigger id="aiFrequency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily - Generate advice every day</SelectItem>
                                        <SelectItem value="weekly">Weekly - Generate advice once per week</SelectItem>
                                        <SelectItem value="on-demand">On-Demand - Generate only when requested</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
