'use client';

import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { DailyReport, getDailyReports } from '@/lib/daily-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        getDailyReports()
            .then((res) => setReports(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
                <Link href="/daily-report">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Report
                    </Button>
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : reports.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">You have no reports</h3>
                        <p className="text-sm text-muted-foreground">
                            Start your day by planning your tasks.
                        </p>
                        <Link href="/daily-report" className="mt-4">
                            <Button>Create Report</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <Card key={report.id} className="hover:bg-accent/50 transition-colors">
                            <Link href={`/daily-report?date=${report.date}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {new Date(report.date).toLocaleDateString('uk-UA', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {report.status === 'PUBLISHED' ? '✅ Published' : '📝 Draft'}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Last updated: {new Date(report.updatedAt).toLocaleString()}
                                    </p>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
