'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, Target, Settings, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Types
interface WizardStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
    { id: 1, title: 'Company Profile', description: 'Basic info & branding', icon: <Building2 className="w-5 h-5" /> },
    { id: 2, title: 'Structure', description: 'Departments & Teams', icon: <Users className="w-5 h-5" /> },
    { id: 3, title: 'Goals', description: 'Set company objectives', icon: <Target className="w-5 h-5" /> },
    { id: 4, title: 'Process', description: 'Daily routine settings', icon: <Settings className="w-5 h-5" /> },
    { id: 5, title: 'Finish', description: 'Review & Launch', icon: <CheckCircle2 className="w-5 h-5" /> },
];

function OrganizationWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshProfile } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // State for all steps
    const [formData, setFormData] = useState({
        // Step 1: Company
        name: '',
        industry: '',
        size: '',
        website: '',

        // Step 2: Structure
        departments: [] as string[],
        teams: [] as string[],

        // Step 3: Goals
        goals: [] as string[],

        // Step 4: Process
        workDays: [1, 2, 3, 4, 5],
        startHour: '09:00',
        endHour: '18:00',
        timezone: 'Europe/Kyiv',
    });

    useEffect(() => {
        const init = async () => {
            if (!user?.orgId) {
                setInitializing(false);
                return;
            }

            try {
                // Fetch existing setup status
                const { data: setup } = await api.get('/setup/organization/status');
                if (setup.setup?.orgCurrentStep) {
                    setCurrentStep(setup.setup.orgCurrentStep);
                }

                // Fetch org details if they exist
                const { data: org } = await api.get(`/organization`);
                setFormData(prev => ({
                    ...prev,
                    name: org.name || '',
                    // ... map other fields
                }));
            } catch (error) {
                console.error('Failed to init wizard', error);
            } finally {
                setInitializing(false);
            }
        };

        if (user) {
            init();
        }
    }, [user]);

    const handleNext = async () => {
        setLoading(true);
        try {
            // Save current step data
            await saveStepData(currentStep);

            // Move to next step
            if (currentStep < WIZARD_STEPS.length) {
                const nextStep = currentStep + 1;
                setCurrentStep(nextStep);
                await api.post('/setup/organization/status', { orgCurrentStep: nextStep });
            } else {
                // Complete wizard
                await api.post('/setup/organization/status', { orgWizardCompleted: true });
                await refreshProfile();
                toast.success('Setup completed successfully!');
                router.push('/dashboard/manager');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save progress');
        } finally {
            setLoading(false);
        }
    };

    const saveStepData = async (step: number) => {
        switch (step) {
            case 1:
                await api.patch(`/organization`, {
                    name: formData.name,
                    // other fields
                });
                break;
            // Add other cases
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Select onValueChange={v => setFormData({ ...formData, industry: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tech">Technology</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="service">Services</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Company Size</Label>
                                <Select onValueChange={v => setFormData({ ...formData, size: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-10">1-10 employees</SelectItem>
                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                        <SelectItem value="50+">50+ employees</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">Structure Setup</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                We&apos;ll help you set up departments and teams.
                            </p>
                            <Button variant="outline" onClick={() => router.push('/admin/departments')}>
                                Configure Structure
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">Company Goals</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Define your main objectives for this quarter.
                            </p>
                            <Button variant="outline" onClick={() => router.push('/settings/kpi')}>
                                Set Goals
                            </Button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Work Schedule</Label>
                            <div className="flex gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`day-${i}`}
                                            checked={formData.workDays.includes(i + 1)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData(prev => ({ ...prev, workDays: [...prev.workDays, i + 1] }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, workDays: prev.workDays.filter(d => d !== i + 1) }));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`day-${i}`} className="text-sm">{day}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" value={formData.startHour} onChange={e => setFormData({ ...formData, startHour: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" value={formData.endHour} onChange={e => setFormData({ ...formData, endHour: e.target.value })} />
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Sparkles className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
                        <p className="text-muted-foreground">
                            Your organization profile has been created. You can now invite your team and start tracking progress.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (initializing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Organization Setup</h1>
                    <p className="text-slate-600">Let&apos;s get your workspace ready for success</p>
                </div>

                {/* Progress */}
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-8">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">
                                    Step {currentStep} of {WIZARD_STEPS.length}
                                </span>
                                <span className="text-sm font-medium text-slate-900">
                                    {Math.round((currentStep / WIZARD_STEPS.length) * 100)}%
                                </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-4">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mb-8">
                            {WIZARD_STEPS.map((step) => (
                                <div key={step.id} className="flex flex-col items-center text-center space-y-2">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                        ${step.id === currentStep ? 'bg-primary text-primary-foreground' :
                                            step.id < currentStep ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}
                                    `}>
                                        {step.id < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className={`text-xs font-medium ${step.id === currentStep ? 'text-primary' : 'text-slate-600'}`}>
                                            {step.title}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            {renderStepContent(currentStep)}
                        </div>

                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1 || loading}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {currentStep === WIZARD_STEPS.length ? 'Finish Setup' : 'Next Step'}
                                {currentStep !== WIZARD_STEPS.length && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function OrganizationWizardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <OrganizationWizardContent />
        </Suspense>
    );
}
