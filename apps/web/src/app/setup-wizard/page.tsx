'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Building2,
    Users,
    Briefcase,
    Brain,
    FileCheck,
    Sparkles,
    Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const WIZARD_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome',
        description: 'Introduction to AI Advisory Board',
        icon: Home,
    },
    {
        id: 'company',
        title: 'Company Settings',
        description: 'Configure company info and work schedule',
        icon: Building2,
    },
    {
        id: 'organization',
        title: 'Organization Structure',
        description: 'Set up departments and teams',
        icon: Users,
    },
    {
        id: 'roles',
        title: 'Job Roles',
        description: 'Define roles from archetypes',
        icon: Briefcase,
    },
    {
        id: 'ai-config',
        title: 'AI Configuration',
        description: 'Configure LLM provider (optional)',
        icon: Brain,
    },
    {
        id: 'review',
        title: 'Review',
        description: 'Review and confirm your setup',
        icon: FileCheck,
    },
    {
        id: 'complete',
        title: 'Complete',
        description: 'You\'re all set!',
        icon: Sparkles,
    },
];

export default function SetupWizardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shouldAdvance = searchParams.get('advance') === 'true';

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Load wizard state from API
        fetchWizardState();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchWizardState = async () => {
        try {
            const response = await fetch('/api/setup/status');
            if (response.ok) {
                const data = await response.json();
                if (data.currentStep !== undefined) {
                    let step = data.currentStep;

                    // Auto-advance if requested
                    if (shouldAdvance && step < WIZARD_STEPS.length - 1) {
                        step = step + 1;
                        // Save this new state immediately
                        await saveStep(step);
                        // Remove the query param to prevent loop
                        router.replace('/setup-wizard', { scroll: false });
                    }

                    setCurrentStep(step);
                }
            }
        } catch (error) {
            console.error('Failed to fetch wizard state:', error);
        }
    };

    const saveStep = async (step: number) => {
        try {
            await fetch('/api/setup/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentStep: step }),
            });
        } catch (error) {
            console.error('Failed to save wizard progress:', error);
        }
    };

    const handleNext = async () => {
        const newCompletedSteps = new Set(completedSteps);
        newCompletedSteps.add(currentStep);
        setCompletedSteps(newCompletedSteps);

        if (currentStep < WIZARD_STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);

            // Save progress
            try {
                await fetch('/api/setup/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentStep: nextStep }),
                });
            } catch (error) {
                console.error('Failed to save wizard progress:', error);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            await fetch('/api/setup/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wizardCompleted: true }),
            });
            router.push('/my-day');
        } catch (error) {
            console.error('Failed to complete wizard:', error);
        }
    };

    const handleSkip = async () => {
        try {
            await fetch('/api/setup/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wizardSkipped: true }),
            });
            router.push('/my-day');
        } catch (error) {
            console.error('Failed to skip wizard:', error);
        }
    };

    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
    const currentStepData = WIZARD_STEPS[currentStep];
    const Icon = currentStepData.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">AI Advisory Board Setup</h1>
                    <p className="text-muted-foreground">
                        Step {currentStep + 1} of {WIZARD_STEPS.length}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <Progress value={progress} className="h-2 mb-4" />
                    <div className="flex justify-between">
                        {WIZARD_STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = completedSteps.has(index);
                            const isCurrent = index === currentStep;

                            return (
                                <div
                                    key={step.id}
                                    className={cn(
                                        'flex flex-col items-center gap-2 flex-1',
                                        'transition-opacity',
                                        !isCurrent && !isCompleted && 'opacity-40'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center',
                                            'transition-colors',
                                            isCompleted && 'bg-green-500 text-white',
                                            isCurrent && !isCompleted && 'bg-blue-500 text-white',
                                            !isCurrent && !isCompleted && 'bg-slate-200 dark:bg-slate-700'
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <StepIcon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className="text-xs text-center hidden md:block">
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                                <p className="text-muted-foreground">{currentStepData.description}</p>
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {renderStepContent(currentStep, router)}
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="text-muted-foreground"
                    >
                        Skip Setup
                    </Button>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={handlePrevious}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                        )}

                        {currentStep < WIZARD_STEPS.length - 1 ? (
                            <Button onClick={handleNext}>
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                className="bg-gradient-to-r from-green-600 to-blue-600"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Complete Setup
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderStepContent(step: number, router: any) {
    switch (step) {
        case 0:
            return <WelcomeStep />;
        case 1:
            return <RedirectStep
                title="Company Settings"
                description="Configure company info and work schedule"
                path="/settings/company?wizard=true&step=1"
                router={router}
            />;
        case 2:
            return <RedirectStep
                title="Organization Structure"
                description="Set up departments and teams"
                path="/settings/organization?wizard=true&step=2"
                router={router}
            />;
        case 3:
            return <RedirectStep
                title="Job Roles"
                description="Define roles from archetypes"
                path="/settings/roles?wizard=true&step=3"
                router={router}
            />;
        case 4:
            return <RedirectStep
                title="AI Configuration"
                description="Configure LLM provider (optional)"
                path="/settings/ai-config?wizard=true&step=4"
                router={router}
            />;
        case 5:
            return <ReviewStep />;
        case 6:
            return <CompleteStep />;
        default:
            return null;
    }
}

function WelcomeStep() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            <h3>Welcome to AI Advisory Board Setup!</h3>
            <p>
                This wizard will help you configure your organization to use AI-powered features
                for team productivity and insights.
            </p>
            <h4>What you'll configure:</h4>
            <ul>
                <li><strong>Company Settings:</strong> Basic info, work schedule, timezone</li>
                <li><strong>Organization Structure:</strong> Departments and teams</li>
                <li><strong>Job Roles:</strong> Define roles based on archetypes</li>
                <li><strong>AI Configuration:</strong> Optional LLM provider for enhanced AI</li>
            </ul>
            <p className="text-muted-foreground">
                You can skip any step and configure it later in Settings.
            </p>
        </div>
    );
}

function RedirectStep({ title, description, path, router }: { title: string; description: string; path: string; router: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full">
                <ArrowRight className="h-12 w-12 text-blue-500" />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2">Go to {title}</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {description}. We'll redirect you to the settings page.
                    Click "Continue to Next Step" in the banner when you're done.
                </p>
                <Button onClick={() => router.push(path)} size="lg" className="gap-2">
                    Open {title}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function ReviewStep() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Configuration</h3>
            <p className="text-muted-foreground">
                Review your setup before completing. You can always change these settings later.
            </p>
            {/* TODO: Show summary of configuration */}
            <div className="grid gap-4 mt-6">
                <StatusCard title="Company Settings" status="configured" />
                <StatusCard title="Organization Structure" status="configured" />
                <StatusCard title="Job Roles" status="configured" />
                <StatusCard title="AI Configuration" status="optional" />
            </div>
        </div>
    );
}

function CompleteStep() {
    return (
        <div className="text-center py-12">
            <div className="mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-white" />
                </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Setup Complete! 🎉</h3>
            <p className="text-muted-foreground mb-6">
                Your AI Advisory Board is ready to use. Click "Complete Setup" to start using AI features.
            </p>
        </div>
    );
}

function StatusCard({ title, status }: { title: string; status: 'configured' | 'optional' | 'pending' }) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <span className="font-medium">{title}</span>
            <Badge variant={status === 'configured' ? 'default' : status === 'optional' ? 'secondary' : 'outline'}>
                {status === 'configured' ? '✓ Configured' : status === 'optional' ? 'Optional' : 'Pending'}
            </Badge>
        </div>
    );
}
