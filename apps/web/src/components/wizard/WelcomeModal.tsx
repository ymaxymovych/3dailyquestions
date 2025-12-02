'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, ArrowRight, X } from 'lucide-react';

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
    onStartWizard: () => void;
}

export function WelcomeModal({ open, onClose, onStartWizard }: WelcomeModalProps) {
    const router = useRouter();

    const handleStartWizard = () => {
        onStartWizard();
        onClose();
    };

    const handleSkip = async () => {
        // Mark wizard as skipped
        try {
            await fetch('/api/setup/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wizardSkipped: true }),
            });
        } catch (error) {
            console.error('Failed to skip wizard:', error);
        }
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Brain className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center">
                        Welcome to AI Advisory Board! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-center text-base mt-2">
                        Your intelligent assistant for team productivity and insights
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="grid gap-4">
                        <Feature
                            icon={<Sparkles className="h-5 w-5 text-purple-600" />}
                            title="AI Mentor"
                            description="Get personalized daily advice based on your workload and role"
                        />
                        <Feature
                            icon={<Brain className="h-5 w-5 text-blue-600" />}
                            title="Manager Digest"
                            description="Automatic team health insights and attention alerts"
                        />
                        <Feature
                            icon={<ArrowRight className="h-5 w-5 text-green-600" />}
                            title="Task Structurizer"
                            description="AI-powered task parsing from raw text to structured format"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Quick Setup:</strong> We'll guide you through a 7-step setup to configure
                            your organization, roles, and AI features. Takes about 10 minutes. ⏱️
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="w-full sm:w-auto"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Skip for now
                    </Button>
                    <Button
                        onClick={handleStartWizard}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Setup Wizard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="mt-0.5">{icon}</div>
            <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
