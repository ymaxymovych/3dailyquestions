'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseNameFromEmail, getEmailType } from '@/lib/utils/name-parser';
import Link from 'next/link';
import { Loader2, Building2, Users, Mail } from 'lucide-react';

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    orgName: z.string().optional(),
});

interface SuggestedOrg {
    id: string;
    name: string;
    slug: string;
    sizeRange: string;
    owner: {
        name: string;
        email: string;
    };
}

export default function RegisterPage() {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailType, setEmailType] = useState<'corporate' | 'free' | 'disposable' | null>(null);
    const [suggestedOrgs, setSuggestedOrgs] = useState<SuggestedOrg[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<SuggestedOrg | null>(null);
    const [showInviteInput, setShowInviteInput] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', fullName: '', password: '', orgName: '' },
    });

    const handleEmailBlur = async () => {
        const email = form.getValues('email');
        if (!email || !email.includes('@')) return;

        // Auto-fill name
        const parsedName = parseNameFromEmail(email);
        if (parsedName && !form.getValues('fullName')) {
            form.setValue('fullName', parsedName);
        }

        // Determine email type
        const type = getEmailType(email);
        setEmailType(type);

        // Fetch suggested organizations for corporate emails
        if (type === 'corporate') {
            try {
                const { data } = await api.get(`/organizations/suggested?email=${email}`);
                setSuggestedOrgs(data);
            } catch (err) {
                console.error('Failed to fetch suggested orgs:', err);
                setSuggestedOrgs([]);
            }
        } else {
            setSuggestedOrgs([]);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError('');
        setLoading(true);

        try {
            let payload: any = {
                email: values.email,
                fullName: values.fullName,
                password: values.password,
            };

            if (selectedOrg) {
                // Join existing org (via slug for now, will use invite system later)
                payload.inviteCode = selectedOrg.slug;
            } else if (values.orgName) {
                // Create new org
                payload.orgName = values.orgName;
            } else {
                setError('Please select an organization or create a new one');
                setLoading(false);
                return;
            }

            const { data } = await api.post('/auth/register', payload);

            // Check if user is pending approval
            if (data.status === 'PENDING') {
                // Store token but don't auto-login
                localStorage.setItem('token', data.access_token);
                // Redirect to pending approval page
                window.location.href = '/pending-approval';
            } else {
                // Normal login flow for ACTIVE users
                login(data.access_token);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Join your team or create a new organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email Field - First */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ivan.petrov@company.com"
                                                {...field}
                                                onBlur={(e) => {
                                                    field.onBlur();
                                                    handleEmailBlur();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email Type Alerts */}
                            {emailType === 'disposable' && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        ❌ Disposable emails are not allowed. Please use a permanent email address.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {emailType === 'free' && (
                                <Alert>
                                    <Mail className="h-4 w-4" />
                                    <AlertDescription>
                                        💡 You're using a personal email. For team collaboration, ask your admin for an invite link.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Full Name Field - Second */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field - Third */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Suggested Organizations */}
                            {suggestedOrgs.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Found Organizations</label>
                                    {suggestedOrgs.map((org) => (
                                        <Card
                                            key={org.id}
                                            className={`cursor-pointer transition-colors ${selectedOrg?.id === org.id ? 'border-primary bg-primary/5' : 'hover:border-gray-400'
                                                }`}
                                            onClick={() => setSelectedOrg(org)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{org.name}</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Owner: {org.owner.email}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Users className="h-3 w-3" />
                                                            {org.sizeRange} employees
                                                        </div>
                                                    </div>
                                                    {selectedOrg?.id === org.id && (
                                                        <div className="text-primary text-sm font-medium">✓ Selected</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Create New Organization */}
                            {(!selectedOrg || suggestedOrgs.length === 0) && emailType !== 'disposable' && (
                                <FormField
                                    control={form.control}
                                    name="orgName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {suggestedOrgs.length > 0 ? 'Or create new organization' : 'Organization Name'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="My Company" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Invite Link Option for Free Emails */}
                            {emailType === 'free' && !showInviteInput && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowInviteInput(true)}
                                >
                                    I have an invite link
                                </Button>
                            )}

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <Button type="submit" className="w-full" disabled={loading || emailType === 'disposable'}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {selectedOrg ? `Join ${selectedOrg.name}` : 'Create Account & Organization'}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
