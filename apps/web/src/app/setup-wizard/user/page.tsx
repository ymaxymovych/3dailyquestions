'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    User,
    Briefcase,
    Settings,
    Sparkles,
    Home,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardJobRoleStep } from '@/components/wizard/WizardJobRoleStep';
import { WizardBanner } from '@/components/wizard/WizardBanner';

// Types
interface WizardStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

interface Router {
    push: (path: string) => void;
    replace: (path: string, options?: { scroll?: boolean }) => void;
}

const WIZARD_STEPS: WizardStep[] = [
    {
        id: 'welcome',
        title: 'Welcome',
        description: 'Personal onboarding',
        icon: Home,
    },
    {
        id: 'basic-info',
        title: 'Basic Info',
        description: 'Your profile information',
        icon: User,
    },
    {
        id: 'job-role',
        title: 'Job Role',
        description: 'Select your role and department',
        icon: Briefcase,
    },
    {
        id: 'preferences',
        title: 'Preferences',
        description: 'Work preferences and notifications',
        icon: Settings,
    },
    {
        id: 'complete',
        title: 'Complete',
        description: "You're all set!",
        icon: Sparkles,
    },
];

const STEP_NAMES = [
    'Welcome',
    'Basic Information',
    'Job Role Selection',
    'Work Preferences',
    'Setup Complete'
];

function UserWizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shouldAdvance = searchParams.get('advance') === 'true';
    const shouldGoBack = searchParams.get('goBack') === 'true';
    const fromStep = searchParams.get('fromStep');

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [hasOrganizationStructure, setHasOrganizationStructure] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchWizardState();
        checkOrganizationStatus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchWizardState = async () => {
        try {
            const response = await fetch('/api/setup/user/status');
            if (response.ok) {
                const data = await response.json();
                if (data.currentStep !== undefined) {
                    let step = data.currentStep;

                    // Auto-advance if requested
                    if (shouldAdvance && step < WIZARD_STEPS.length - 1) {
                        if (fromStep) {
                            step = parseInt(fromStep);
                        }
                        step = step + 1;
                        await saveStep(step);
                        router.replace('/setup-wizard/user', { scroll: false });
                    }

                    // Go back if requested
                    if (shouldGoBack && fromStep) {
                        step = parseInt(fromStep) - 1;
                        if (step >= 0) {
                            await saveStep(step);
                            router.replace('/setup-wizard/user', { scroll: false });
                        }
                    }

                    setCurrentStep(step);
                }
            }
        } catch (error) {
            console.error('Failed to fetch wizard state:', error);
        }
    };

    const checkOrganizationStatus = async () => {
        try {
            const response = await fetch('/api/setup/organization/status');
            if (response.ok) {
                const data = await response.json();
                setHasOrganizationStructure(data.setup?.structureConfigured || false);
                // Check if user is admin (simplified - check if user has ADMIN role)
                // TODO: Implement proper admin check
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Failed to check organization status:', error);
        }
    };

    const saveStep = async (step: number) => {
        try {
            await fetch('/api/setup/user/status', {
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
            await saveStep(nextStep);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            await fetch('/api/setup/user/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: true }),
            });
            router.push('/my-day');
        } catch (error) {
            console.error('Failed to complete wizard:', error);
        }
    };

    const handleSkip = async () => {
        try {
            await fetch('/api/setup/user/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skipped: true }),
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Personal Setup</h1>
                    <p className="text-muted-foreground">
                        Step {currentStep + 1} of {WIZARD_STEPS.length}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-4">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
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
                                            isCurrent && !isCompleted && 'bg-purple-500 text-white',
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
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                                <p className="text-muted-foreground">{currentStepData.description}</p>
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {
                                renderStepContent(
                                    currentStep,
                                    router,
                                    handleNext,
                                    hasOrganizationStructure,
                                    isAdmin,
                                    handleSkip
                                )
                            }
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation handled by WizardBanner */}
            </div>

            <WizardBanner
                currentStep={currentStep + 1}
                totalSteps={WIZARD_STEPS.length}
                stepName={STEP_NAMES[currentStep]}
                onNext={currentStep === WIZARD_STEPS.length - 1 ? handleComplete : handleNext}
                onBack={handlePrevious}
                onSkip={handleSkip}
                hideNext={currentStep === 2} // Hide Next for Job Role step as it has its own control
                hideBack={currentStep === 0}
                nextLabel={currentStep === WIZARD_STEPS.length - 1 ? 'Complete Setup' : 'Next'}
            />
        </div>
    );
}

function renderStepContent(
    step: number,
    router: Router,
    handleNext: () => void,
    hasOrganizationStructure: boolean,
    isAdmin: boolean,
    handleSkip: () => void
) {
    switch (step) {
        case 0:
            return <WelcomeStep />;
        case 1:
            return <BasicInfoStep onComplete={handleNext} />;
        case 2:
            return (
                <JobRoleStepWrapper
                    onComplete={handleNext}
                    hasOrganizationStructure={hasOrganizationStructure}
                    isAdmin={isAdmin}
                    router={router}
                    handleSkip={handleSkip}
                />
            );
        case 3:
            return <PreferencesStep onComplete={handleNext} />;
        case 4:
            return <CompleteStep />;
        default:
            return null;
    }
}

function WelcomeStep() {
    return (
        <div className="prose dark:prose-invert max-w-none">
            <h3>Welcome! Let&apos;s Set Up Your Profile</h3>
            <p>
                This quick setup will help personalize your experience and enable AI-powered
                features tailored to your role.
            </p>
            <h4>What you&apos;ll configure:</h4>
            <ul>
                <li><strong>Basic Info:</strong> Your profile details</li>
                <li><strong>Job Role:</strong> Your department and role for personalized KPIs</li>
                <li><strong>Preferences:</strong> Notification and work settings</li>
            </ul>
            <p className="text-muted-foreground">
                This should only take a few minutes. You can skip any step and complete it later.
            </p>
        </div>
    );
}

function BasicInfoStep({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full">
                <User className="h-12 w-12 text-purple-500" />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Your basic profile is set up from registration. You can update it in Settings.
                </p>
            </div>
        </div>
    );
}

function JobRoleStepWrapper({
    onComplete,
    hasOrganizationStructure,
    isAdmin,
    router,
    handleSkip,
}: {
    onComplete: () => void;
    hasOrganizationStructure: boolean;
    isAdmin: boolean;
    router: Router;
    handleSkip: () => void;
}) {
    if (!hasOrganizationStructure) {
        return (
            <div className="space-y-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Organization Structure Not Set Up</AlertTitle>
                    <AlertDescription>
                        {isAdmin ? (
                            <div className="space-y-4">
                                <p>
                                    Your organization structure hasn&apos;t been configured yet.
                                    Would you like to set it up now?
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => router.push('/setup-wizard/organization')}
                                        size="sm"
                                    >
                                        Set Up Organization
                                    </Button>
                                    <Button variant="outline" onClick={handleSkip} size="sm">
                                        Skip for Now
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p>
                                    Your organization is still being set up. You can select a general
                                    role type for now, or skip and complete this later.
                                </p>
                                <Button variant="outline" onClick={handleSkip} size="sm">
                                    Skip for Now
                                </Button>
                            </div>
                        )}
                    </AlertDescription>
                </Alert>
                <WizardJobRoleStep onComplete={onComplete} />
            </div>
        );
    }

    return <WizardJobRoleStep onComplete={onComplete} />;
}

function PreferencesStep({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full">
                <Settings className="h-12 w-12 text-purple-500" />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2">Work Preferences</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You can configure notifications and work hours in Settings → Personal.
                </p>
                <div className="flex gap-3 justify-center">
                    {/* Controls moved to banner */}
                </div>
            </div>
        </div>
    );
}

function CompleteStep() {
    return (
        <div className="text-center py-12">
            <div className="mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-purple-500 flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-white" />
                </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">You&apos;re All Set! 🎉</h3>
            <p className="text-muted-foreground mb-6">
                Your profile is configured. Let&apos;s start using AI Advisory Board!
            </p>
        </div>
    );
}

export default function UserWizardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <UserWizardContent />
        </Suspense>
    );
}
