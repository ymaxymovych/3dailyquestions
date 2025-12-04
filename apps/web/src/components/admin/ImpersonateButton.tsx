'use client';

import { impersonateUser } from '@/actions/admin/auth';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import { useTransition } from 'react';

export function ImpersonateButton({ userId }: { userId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
                if (confirm('Are you sure you want to login as this user?')) {
                    startTransition(() => impersonateUser(userId));
                }
            }}
        >
            <UserCog className="mr-2 h-4 w-4" />
            Login As
        </Button>
    );
}
