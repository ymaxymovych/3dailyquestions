import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MessageSquare, Activity, AlertTriangle } from 'lucide-react';

interface Stats {
    activeWorkspaces: number;
    scheduledStandups: number;
    responseRate: number;
    errorCount: number;
}

export function StatsCards({ stats }: { stats: Stats }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Workspaces</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeWorkspaces}</div>
                    <p className="text-xs text-muted-foreground">
                        +2 from last week
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled Standups</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.scheduledStandups}</div>
                    <p className="text-xs text-muted-foreground">
                        For today
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.responseRate}%</div>
                    <p className="text-xs text-muted-foreground">
                        +5% from yesterday
                    </p>
                </CardContent>
            </Card>
            <Card className={stats.errorCount > 0 ? "border-red-500/50 bg-red-500/5" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Errors (24h)</CardTitle>
                    <AlertTriangle className={`h-4 w-4 ${stats.errorCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.errorCount > 0 ? "text-red-500" : ""}`}>{stats.errorCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Critical system alerts
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
