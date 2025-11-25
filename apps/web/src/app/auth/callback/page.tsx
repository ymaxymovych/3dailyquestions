'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            login(token);
            // login function usually redirects, but if not:
            // router.push('/dashboard'); 
        } else {
            router.push('/login?error=No token provided');
        }
    }, [searchParams, login, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Authenticating...</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </CardContent>
            </Card>
        </div>
    );
}
