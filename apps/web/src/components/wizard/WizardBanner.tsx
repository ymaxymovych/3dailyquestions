"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardBannerProps {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    onNext?: () => void | Promise<void>;
    onBack?: () => void;
    onSkip?: () => void;
    hideNext?: boolean;
    hideBack?: boolean;
    nextLabel?: string;
    nextDisabled?: boolean;
    className?: string;
}

export function WizardBanner({
    currentStep,
    totalSteps,
    stepName,
    onNext,
    onBack,
    onSkip,
    hideNext = false,
    hideBack = false,
    nextLabel,
    nextDisabled = false,
    className
}: WizardBannerProps) {
    const progress = (currentStep / totalSteps) * 100;
    const isLastStep = currentStep === totalSteps;
    const isFirstStep = currentStep === 1;

    // Auto-detect label based on step
    const buttonLabel = nextLabel || (isLastStep ? "Finish" : "Next");

    const handleNextClick = () => {
        if (onNext) {
            onNext();
        }
    };

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 lg:left-64 bg-background border-t shadow-lg z-50",
            className
        )}>
            <div className="container mx-auto px-4 py-4">
                {/* Navigation Row */}
                <div className="flex items-center justify-between mb-3">
                    {/* Back Button */}
                    {!hideBack ? (
                        <Button
                            variant="outline"
                            onClick={onBack}
                            disabled={isFirstStep}
                            className="min-w-[100px]"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    ) : (
                        <div className="min-w-[100px]" /> // Spacer
                    )}

                    {/* Step Indicator */}
                    <div className="flex flex-col items-center">
                        <div className="text-sm font-medium">
                            Step {currentStep} of {totalSteps}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {stepName}
                        </div>
                    </div>

                    {/* Next Button */}
                    {!hideNext ? (
                        <Button
                            onClick={handleNextClick}
                            disabled={nextDisabled}
                            className="min-w-[100px]"
                        >
                            {buttonLabel}
                            {isLastStep ? (
                                <Check className="h-4 w-4 ml-2" />
                            ) : (
                                <ArrowRight className="h-4 w-4 ml-2" />
                            )}
                        </Button>
                    ) : (
                        <div className="min-w-[100px]" /> // Spacer
                    )}
                </div>

                {/* Progress Bar */}
                <Progress value={progress} className="h-2 mb-2" />

                {/* Skip Button (Optional) */}
                {onSkip && (
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSkip}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Skip Setup
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
