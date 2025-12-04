'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// MVP: Hardcoded list of super admins
const SUPER_ADMIN_EMAILS = [
    'yaroslav.maxymovych@gmail.com', // Primary admin
    'admin@crystalkuiper.com',
    'dev@crystalkuiper.com'
];

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
                return;
            }

            if (!SUPER_ADMIN_EMAILS.includes(user.email)) {
                console.warn(`Access denied for ${user.email} to Super Admin area`);
                router.push('/'); // Or a 403 page
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                <div className="animate-pulse">Checking clearance...</div>
            </div>
        );
    }

    if (!user || !SUPER_ADMIN_EMAILS.includes(user.email)) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
