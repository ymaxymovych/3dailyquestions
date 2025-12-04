'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import wizardApi from '@/lib/wizardApi';

export default function SetupWizardRedirect() {
    const router = useRouter();
    const [status, setStatus] = useState<string>('Checking setup status...');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Check Organization Setup Status
                const { data } = await wizardApi.get('/setup/organization/status');
                const setup = data.setup;

                if (!setup?.orgWizardCompleted) {
                    setStatus('Redirecting to Organization Setup...');
                    router.replace('/setup-wizard/organization');
                } else {
                    setStatus('Redirecting to User Setup...');
                    router.replace('/setup-wizard/user');
                }
            } catch (error) {
                console.error('Failed to check setup status:', error);
                setStatus('Error checking status. Redirecting to dashboard...');
                // Fallback
                router.replace('/my-day');
            }
        };

        checkStatus();
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">{status}</p>
        </div>
    );
}
