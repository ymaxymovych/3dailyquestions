'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle2, XCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SetupStatus {
    companyConfigured: boolean;
    structureConfigured: boolean;
    rolesConfigured: boolean;
    employeesAdded: boolean;
    aiEnabled: boolean;
}

export default function AIAdvisoryPage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<SetupStatus>({
        companyConfigured: false,
        structureConfigured: false,
        rolesConfigured: false,
        employeesAdded: false,
        aiEnabled: false,
    });
    const [stats, setStats] = useState({
        departments: 0,
        teams: 0,
        jobRoles: 0,
        users: 0,
    });

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/setup/status');
            if (!response.ok) {
                throw new Error('Failed to fetch status');
            }

            const data = await response.json();

            setStats({
                departments: data.counts.departments,
                teams: data.counts.teams,
                jobRoles: data.counts.jobRoles,
                users: data.counts.users,
            });

            setStatus({
                companyConfigured: data.setup.companyConfigured,
                structureConfigured: data.setup.structureConfigured,
                rolesConfigured: data.setup.rolesConfigured,
                employeesAdded: data.setup.employeesConfigured,
                aiEnabled: data.setup.aiMentorEnabled || data.setup.managerDigestEnabled,
            });
        } catch (error) {
            console.error('Failed to fetch AI advisory status:', error);
        } finally {
            setLoading(false);
        }
    };

    const aiMentorReady = status.companyConfigured && status.rolesConfigured && status.employeesAdded;
    const managerDigestReady = status.structureConfigured && status.rolesConfigured;
    const taskStructurizerReady = true; // Always available

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading AI features status...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Brain className="h-8 w-8" />
                    AI Advisory Board
                </h1>
                <p className="text-muted-foreground mt-2">
                    Configure and activate AI-powered features for your team
                </p>
            </div>

            {/* Overall Status */}
            <Alert className={status.aiEnabled ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
                <Brain className={`h-4 w-4 ${status.aiEnabled ? 'text-green-600' : ''}`} />
                <AlertDescription>
                    {status.aiEnabled ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                            AI features are ACTIVE
                        </span>
                    ) : (
                        <span>
                            AI features are not enabled. Complete the configuration below to activate.
                        </span>
                    )}
                </AlertDescription>
            </Alert>

            {/* Configuration Checklist */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration Status</CardTitle>
                    <CardDescription>
                        Complete these steps to unlock AI features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <ConfigItem
                        title="Company Settings"
                        description={`Configure work schedule and AI policy (${stats.departments} departments)`}
                        completed={status.companyConfigured}
                        link="/settings/company"
                    />
                    <ConfigItem
                        title="Organization Structure"
                        description={`Create departments and teams (${stats.departments} depts, ${stats.teams} teams)`}
                        completed={status.structureConfigured}
                        link="/settings/organization"
                    />
                    <ConfigItem
                        title="Job Roles"
                        description={`Define roles from archetypes (${stats.jobRoles} roles created)`}
                        completed={status.rolesConfigured}
                        link="/settings/roles"
                    />
                    <ConfigItem
                        title="Team Members"
                        description={`Add at least 2 employees (${stats.users} users)`}
                        completed={status.employeesAdded}
                        link="/admin/team"
                    />
                </CardContent>
            </Card>

            {/* AI Features */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* AI Mentor */}
                <Card className={aiMentorReady ? 'border-green-500' : ''}>
                    <CardHeader>
                        <CardTitle className="text-lg">AI Mentor</CardTitle>
                        <CardDescription>
                            Daily personalized advice for employees
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FeatureStatus
                            ready={aiMentorReady}
                            enabled={status.aiEnabled && aiMentorReady}
                        />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Provides:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>3 actions for today</li>
                                <li>Task overload warnings</li>
                                <li>Main focus identification</li>
                            </ul>
                        </div>
                        {!aiMentorReady && (
                            <p className="text-xs text-amber-600">
                                Requires: Company, Roles, Employees
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Manager Digest */}
                <Card className={managerDigestReady ? 'border-green-500' : ''}>
                    <CardHeader>
                        <CardTitle className="text-lg">Manager Digest</CardTitle>
                        <CardDescription>
                            Daily team overview for managers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FeatureStatus
                            ready={managerDigestReady}
                            enabled={status.aiEnabled && managerDigestReady}
                        />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Provides:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Team members needing attention</li>
                                <li>Key risks & narratives</li>
                                <li>Overall team health</li>
                            </ul>
                        </div>
                        {!managerDigestReady && (
                            <p className="text-xs text-amber-600">
                                Requires: Structure, Roles
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Task Structurizer */}
                <Card className="border-green-500">
                    <CardHeader>
                        <CardTitle className="text-lg">Task Structurizer</CardTitle>
                        <CardDescription>
                            Convert raw text to structured tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FeatureStatus
                            ready={taskStructurizerReady}
                            enabled={status.aiEnabled}
                        />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Provides:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Auto-extract title & outcome</li>
                                <li>Generate action steps</li>
                                <li>Suggest DoD & priority</li>
                            </ul>
                        </div>
                        <p className="text-xs text-green-600">
                            Always available!
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <Link href="/settings/company">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Company
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/settings/roles">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Roles
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/settings/archetypes">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Archetypes Library
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function ConfigItem({
    title,
    description,
    completed,
    link,
}: {
    title: string;
    description: string;
    completed: boolean;
    link: string;
}) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="mt-0.5">
                {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
            </div>
            <div className="flex-1">
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button asChild variant="ghost" size="sm">
                <Link href={link}>
                    {completed ? 'View' : 'Configure'}
                </Link>
            </Button>
        </div>
    );
}

function FeatureStatus({ ready, enabled }: { ready: boolean; enabled: boolean }) {
    if (enabled) {
        return (
            <Badge className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
            </Badge>
        );
    }

    if (ready) {
        return (
            <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Ready (Not Enabled)
            </Badge>
        );
    }

    return (
        <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Configuration Needed
        </Badge>
    );
}
