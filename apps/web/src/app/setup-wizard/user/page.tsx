'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Check,
    User,
    Users,
    Settings,
    Sparkles,
    Home,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardBanner } from '@/components/wizard/WizardBanner';
import { BasicInfoStep } from '@/components/wizard/user/BasicInfoStep';
import { TeamStep } from '@/components/wizard/user/TeamStep';
import { PreferencesStep } from '@/components/wizard/user/PreferencesStep';
import { useAuth } from '@/context/AuthContext';
import wizardApi from '@/lib/wizardApi';

// Types
interface WizardStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
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
        id: 'team',
        title: 'Team & Role',
        description: 'Join or create your team',
        icon: Users,
    },
    {
        id: 'preferences',
        title: 'Preferences',
        description: 'Work preferences',
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
    'Team Setup',
    'Work Preferences',
    'Setup Complete'
];

function UserWizardContent() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [userRole, setUserRole] = useState<'MANAGER' | 'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!user) return;

            try {
                // Fetch wizard state
                const { data: status } = await wizardApi.get('/setup/user/status');
                if (status.currentStep) {
                    setCurrentStep(status.currentStep);
                }

                // Determine User Role Logic
                // This should ideally come from the backend based on Invite or Roles
                // For now, we'll check if they have 'MANAGER' role or are Admin
                // TODO: Fetch real role from API
                const isManager = user.roles?.includes('MANAGER') || false;
                const isAdmin = user.roles?.includes('ADMIN') || false;

                if (isAdmin) setUserRole('ADMIN');
                else if (isManager) setUserRole('MANAGER');
                else setUserRole('EMPLOYEE');

            } catch (error) {
                console.error('Failed to init user wizard', error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [user]);

    const saveStep = async (step: number) => {
        try {
            await wizardApi.post('/setup/user/status', { currentStep: step });
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
        } else {
            // Complete
            await handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            await wizardApi.post('/setup/user/status', { completed: true });
            await refreshProfile();
            router.push('/my-day');
        } catch (error) {
            console.error('Failed to complete wizard:', error);
        }
    };

    const handleSkip = async () => {
        try {
            await wizardApi.post('/setup/user/status', { skipped: true });
            router.push('/my-day');
        } catch (error) {
            console.error('Failed to skip wizard:', error);
        }
    };

    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
    const currentStepData = WIZARD_STEPS[currentStep];
    const Icon = currentStepData.icon;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

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
                            {renderStepContent(currentStep, handleNext, userRole, user?.departmentId)}
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
                hideNext={currentStep === 1 || currentStep === 2 || currentStep === 3} // Hide next for steps with internal forms
                hideBack={currentStep === 0}
                nextLabel={currentStep === WIZARD_STEPS.length - 1 ? 'Complete Setup' : 'Next'}
            />
        </div>
    );
}

function renderStepContent(
    step: number,
    handleNext: () => void,
    userRole: 'MANAGER' | 'EMPLOYEE' | 'ADMIN',
    departmentId?: string | null
) {
    switch (step) {
        case 0:
            return <WelcomeStep />;
        case 1:
            return <BasicInfoStep onComplete={handleNext} />;
        case 2:
            return (
                <TeamStep
                    userRole={userRole}
                    departmentId={departmentId || undefined}
                    onComplete={handleNext}
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
        <div className="prose dark:prose-invert max-w-none text-center py-8">
            <h3>Welcome! Let&apos;s Set Up Your Profile</h3>
            <p>
                This quick setup will help personalize your experience and enable AI-powered
                features tailored to your role.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mt-8">
                <div className="p-4 border rounded-lg bg-slate-50">
                    <User className="w-6 h-6 text-blue-500 mb-2" />
                    <h4 className="font-semibold m-0">Profile</h4>
                    <p className="text-sm text-muted-foreground m-0">Basic info & photo</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                    <Users className="w-6 h-6 text-purple-500 mb-2" />
                    <h4 className="font-semibold m-0">Team</h4>
                    <p className="text-sm text-muted-foreground m-0">Join or create team</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                    <Settings className="w-6 h-6 text-green-500 mb-2" />
                    <h4 className="font-semibold m-0">Preferences</h4>
                    <p className="text-sm text-muted-foreground m-0">Work hours & alerts</p>
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
