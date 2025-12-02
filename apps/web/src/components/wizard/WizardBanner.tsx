'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';

export function WizardBanner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isWizardMode = searchParams.get('wizard') === 'true';
    const step = searchParams.get('step');

    if (!isWizardMode) return null;

    const handleContinue = () => {
        router.push('/setup-wizard?advance=true');
    };

    return (
        <>
            <div className="h-24" aria-hidden="true" />
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Setup Wizard In Progress</h3>
                        <p className="text-sm text-blue-100">
                            Configure your settings and click Continue when done.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleContinue}
                            className="font-semibold"
                        >
                            Continue to Next Step
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
