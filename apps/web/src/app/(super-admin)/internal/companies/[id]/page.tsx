import { getCompanyDetails } from '@/actions/admin/dashboard';
import { ImpersonateButton } from '@/components/admin/ImpersonateButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Mail, Shield, Users, Activity, Flame } from 'lucide-react';
import Link from 'next/link';

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const company = await getCompanyDetails(id);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/internal/companies">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{company.name}</h2>
                    <p className="text-muted-foreground">{company.domain} | {company.id}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant={company.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {company.status}
                    </Badge>
                    <Button variant="outline">Send Test Standup</Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="config">Config</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{company.usersCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{company.activeToday}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Streak</CardTitle>
                                <Flame className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{company.streak} days</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {company.users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">{user.role}</Badge>
                                            <div className="text-sm text-muted-foreground">
                                                Last reply: {user.lastReply}
                                            </div>
                                            <ImpersonateButton userId={user.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Timezone</label>
                                    <div className="flex items-center gap-2 p-2 border rounded-md">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        {company.timezone}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Schedule</label>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 border rounded-md">Morning: {company.schedule.morning}</div>
                                        <div className="p-2 border rounded-md">Evening: {company.schedule.evening}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Modules</label>
                                <div className="flex gap-4">
                                    <Badge variant={company.modules.voice ? 'default' : 'secondary'}>Voice Input</Badge>
                                    <Badge variant={company.modules.bigTask ? 'default' : 'secondary'}>Big Task</Badge>
                                    <Badge variant={company.modules.weeklyReview ? 'default' : 'secondary'}>Weekly Review</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

