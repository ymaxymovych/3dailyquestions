import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { InviteUserModal } from './InviteUserModal';

interface Organization {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    maxUsers: number;
    maxProjects: number;
    _count: {
        users: number;
        projects: number;
    };
}

export function OrganizationTab() {
    const { user } = useAuth();
    const [org, setOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user?.orgId) {
            fetchOrganization();
        }
    }, [user?.orgId]);

    const fetchOrganization = async () => {
        try {
            const { data } = await api.get(`/organizations/${user?.orgId}`);
            setOrg(data);
        } catch (error) {
            console.error('Failed to fetch organization:', error);
            toast.error('Failed to load organization details');
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = () => {
        if (org?.slug) {
            navigator.clipboard.writeText(org.slug);
            setCopied(true);
            toast.success('Invite code copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return <div>Loading organization details...</div>;
    }

    if (!org) {
        return <div>Organization not found</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>
                        Manage your organization settings and view subscription details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input id="orgName" value={org.name} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plan">Current Plan</Label>
                            <div className="flex items-center space-x-2">
                                <Input id="plan" value={org.plan.toUpperCase()} readOnly className="w-full" />
                                <Badge variant={org.status === 'active' ? 'default' : 'destructive'}>
                                    {org.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Usage</Label>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground">Users</div>
                                <div className="text-2xl font-bold">
                                    {org._count.users} / {org.maxUsers}
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <div className="text-sm font-medium text-muted-foreground">Projects</div>
                                <div className="text-2xl font-bold">
                                    {org._count.projects} / {org.maxProjects}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Team Members</CardTitle>
                    <CardDescription>
                        Share this code with your team members to let them join your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="inviteCode" className="sr-only">
                                Invite Code
                            </Label>
                            <Input
                                id="inviteCode"
                                value={org.slug || org.id}
                                readOnly
                                className="font-mono bg-muted"
                            />
                        </div>
                        <Button type="submit" size="sm" className="px-3" onClick={copyInviteCode}>
                            <span className="sr-only">Copy</span>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This code is unique to your organization. Anyone with this code can request to join.
                    </p>
                    <div className="mt-4">
                        <InviteUserModal />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
