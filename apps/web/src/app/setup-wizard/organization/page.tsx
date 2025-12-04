'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, CalendarClock, Brain, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import wizardApi from '@/lib/wizardApi';
import { useAuth } from '@/context/AuthContext';
import { WizardBanner } from '@/components/wizard/WizardBanner';

// Types
interface WizardStep {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
    { id: 1, title: 'Welcome', description: 'Vision & Goals', icon: <Sparkles className="w-5 h-5" /> },
    { id: 2, title: 'Company Profile', description: 'Basic info & branding', icon: <Building2 className="w-5 h-5" /> },
    { id: 3, title: 'Structure', description: 'Departments & Teams', icon: <Users className="w-5 h-5" /> },
    { id: 4, title: 'Work Schedule', description: 'Days & Hours', icon: <CalendarClock className="w-5 h-5" /> },
    { id: 5, title: 'AI Policy', description: 'AI Behavior Settings', icon: <Brain className="w-5 h-5" /> },
    { id: 6, title: 'Complete', description: 'Review & Launch', icon: <CheckCircle2 className="w-5 h-5" /> },
];

const STEP_NAMES = [
    'Welcome',
    'Company Profile',
    'Organization Structure',
    'Work Schedule',
    'AI Configuration',
    'Complete Setup'
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
        // Step 2: Company
        name: '',
        industry: '',
        size: '',
        website: '',

        // Step 4: Schedule
        workDays: [1, 2, 3, 4, 5],
        startHour: '09:00',
        endHour: '18:00',
        timezone: 'Europe/Kyiv',

        // Step 5: AI
        aiProvider: 'openai',
        aiTone: 'professional',
    });

    useEffect(() => {
        const init = async () => {
            if (!user?.orgId) {
                setInitializing(false);
                return;
            }

            try {
                // Fetch existing setup status
                const { data: setup } = await wizardApi.get('/setup/organization/status');
                if (setup.setup?.orgCurrentStep) {
                    setCurrentStep(setup.setup.orgCurrentStep);
                }

                // Fetch org details if they exist
                const { data: org } = await wizardApi.get(`/organization`);
                setFormData(prev => ({
                    ...prev,
                    name: org.name || '',
                    industry: org.industry || '',
                    size: org.size || '',
                    // Map other fields as needed
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
                await wizardApi.post('/setup/organization/status', { orgCurrentStep: nextStep });
            } else {
                // Complete wizard
                await wizardApi.post('/setup/organization/status', { orgWizardCompleted: true });
                await refreshProfile();
                toast.success('Organization setup completed!');
                // Redirect to User Wizard for personal setup
                router.push('/setup-wizard/user');
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
            case 2: // Company
                await wizardApi.patch(`/organization`, {
                    name: formData.name,
                    industry: formData.industry,
                    size: formData.size,
                });
                break;
            case 4: // Schedule
                await wizardApi.patch(`/organization/settings`, {
                    workSchedule: {
                        days: formData.workDays,
                        start: formData.startHour,
                        end: formData.endHour,
                        timezone: formData.timezone
                    }
                });
                break;
            case 5: // AI
                await wizardApi.patch(`/organization/ai-settings`, {
                    provider: formData.aiProvider,
                    tone: formData.aiTone
                });
                break;
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 1: // Welcome
                return (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Sparkles className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Welcome to Crystal Kuiper</h2>
                            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                                Let's set up your organization's digital workspace. This wizard will help you configure the core structure, schedule, and AI capabilities.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mt-8">
                            <div className="p-4 border rounded-lg bg-white/50">
                                <Building2 className="w-6 h-6 text-blue-500 mb-2" />
                                <h3 className="font-semibold">Company Identity</h3>
                                <p className="text-sm text-muted-foreground">Define your brand and industry context.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-white/50">
                                <Users className="w-6 h-6 text-green-500 mb-2" />
                                <h3 className="font-semibold">Team Structure</h3>
                                <p className="text-sm text-muted-foreground">Organize departments and teams.</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-white/50">
                                <Brain className="w-6 h-6 text-purple-500 mb-2" />
                                <h3 className="font-semibold">AI Power</h3>
                                <p className="text-sm text-muted-foreground">Configure your AI advisory board.</p>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Company Profile
                return (
                    <div className="space-y-4 max-w-xl mx-auto">
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
                                <Select value={formData.industry} onValueChange={v => setFormData({ ...formData, industry: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tech">Technology</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="service">Services</SelectItem>
                                        <SelectItem value="finance">Finance</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Company Size</Label>
                                <Select value={formData.size} onValueChange={v => setFormData({ ...formData, size: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-10">1-10 employees</SelectItem>
                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                        <SelectItem value="201+">201+ employees</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Structure
                return (
                    <div className="space-y-6 max-w-2xl mx-auto text-center">
                        <div className="p-8 border-2 border-dashed rounded-lg bg-slate-50/50">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium mb-2">Organization Structure</h3>
                            <p className="text-muted-foreground mb-6">
                                Set up your departments (e.g., Sales, Marketing) and teams.
                                This defines how work flows and who reports to whom.
                            </p>
                            <Button onClick={() => router.push('/admin/departments')} className="gap-2">
                                Configure Structure
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4">
                                Opens in a new view. Return here when done.
                            </p>
                        </div>
                    </div>
                );
            case 4: // Work Schedule
                return (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="space-y-3">
                            <Label className="text-base">Working Days</Label>
                            <div className="flex flex-wrap gap-3">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                    <div key={day} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 transition-colors">
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
                                        <label htmlFor={`day-${i}`} className="text-sm font-medium cursor-pointer">{day}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" value={formData.startHour} onChange={e => setFormData({ ...formData, startHour: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" value={formData.endHour} onChange={e => setFormData({ ...formData, endHour: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select value={formData.timezone} onValueChange={v => setFormData({ ...formData, timezone: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Europe/Kyiv">Kyiv (GMT+2/3)</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 5: // AI Policy
                return (
                    <div className="space-y-6 max-w-xl mx-auto">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>AI Provider</Label>
                                <Select value={formData.aiProvider} onValueChange={v => setFormData({ ...formData, aiProvider: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                                        <SelectItem value="azure">Azure OpenAI</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Select the LLM provider for your organization's AI features.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>AI Tone & Style</Label>
                                <Select value={formData.aiTone} onValueChange={v => setFormData({ ...formData, aiTone: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tone..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">Professional & Concise</SelectItem>
                                        <SelectItem value="friendly">Friendly & Encouraging</SelectItem>
                                        <SelectItem value="analytical">Analytical & Data-driven</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Determines how the AI Mentor communicates with your team.</p>
                            </div>
                        </div>
                    </div>
                );
            case 6: // Complete
                return (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Organization Setup Complete!</h2>
                            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                                You've successfully configured the company structure. Now, let's set up your personal profile and preferences.
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg max-w-md mx-auto text-sm">
                            Next: You will be redirected to the <strong>User Onboarding Wizard</strong> to set up your personal account details.
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (initializing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Organization Setup</h1>
                    <p className="text-slate-600">Step {currentStep} of {WIZARD_STEPS.length}: {STEP_NAMES[currentStep - 1]}</p>
                </div>

                {/* Progress */}
                <Card className="overflow-hidden border-none shadow-lg">
                    <div className="h-2 bg-slate-100">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                        />
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-6 gap-2 mb-8">
                            {WIZARD_STEPS.map((step) => (
                                <div key={step.id} className="flex flex-col items-center text-center space-y-2 group">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                        ${step.id === currentStep ? 'bg-primary text-primary-foreground scale-110 shadow-md' :
                                            step.id < currentStep ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}
                                    `}>
                                        {step.id < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                                    </div>
                                    <div className="hidden md:block">
                                        <div className={`text-xs font-medium transition-colors ${step.id === currentStep ? 'text-primary' : 'text-slate-500'}`}>
                                            {step.title}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 mb-24 min-h-[300px]">
                            {renderStepContent(currentStep)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Wizard Navigation Banner */}
            <WizardBanner
                currentStep={currentStep}
                totalSteps={WIZARD_STEPS.length}
                stepName={STEP_NAMES[currentStep - 1]}
                onNext={handleNext}
                onBack={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                nextDisabled={loading}
                nextLabel={currentStep === WIZARD_STEPS.length ? 'Continue to User Setup' : 'Next Step'}
            />
        </div>
    );
}

export default function OrganizationWizardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <OrganizationWizardContent />
        </Suspense>
    );
}
