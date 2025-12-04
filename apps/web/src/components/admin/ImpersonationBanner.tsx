'use client';

import { stopImpersonation } from '@/actions/admin/auth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useTransition } from 'react';

export function ImpersonationBanner() {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-4 bg-orange-600 px-4 py-2 text-white shadow-lg">
            <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-5 w-5" />
                <span>You are currently impersonating a user. Actions will be recorded.</span>
            </div>
            <Button
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => startTransition(() => stopImpersonation())}
                className="bg-white text-orange-600 hover:bg-orange-50"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Exit Impersonation
            </Button>
        </div>
    );
}
