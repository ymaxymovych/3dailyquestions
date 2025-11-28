'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, CheckCircle } from 'lucide-react';

export default function PendingApprovalPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is not pending, redirect to dashboard
        if (user && user.status !== 'PENDING') {
            router.push('/');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl">Pending Approval</CardTitle>
                    <CardDescription>
                        Your account is waiting for administrator approval
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-medium text-blue-900 mb-1">What happens next?</h3>
                                <p className="text-sm text-blue-700">
                                    An administrator will review your request to join the organization.
                                    You'll receive an email notification once your account is approved.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Your account has been created</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span>Waiting for admin approval</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-4">
                            Signed in as: <span className="font-medium">{user.email}</span>
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={logout}
                        >
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
