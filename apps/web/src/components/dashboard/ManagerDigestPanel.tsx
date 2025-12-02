'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, AlertTriangle, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

interface ManagerDigestProps {
    teamId?: string;
    departmentId?: string;
    date?: Date;
}

interface Person {
    userId: string;
    name: string;
    role?: string;
    reasons: string[];
}

interface DigestData {
    summary: string;
    highlights: string[];
    concerns: string[];
    peopleNeedingAttention: Person[];
    metrics: {
        teamSize: number;
        reportsSubmitted: number;
        reportRate: number;
        needingAttention: number;
    };
}

export function ManagerDigestPanel({ teamId, departmentId, date }: ManagerDigestProps) {
    const [loading, setLoading] = useState(false);
    const [digest, setDigest] = useState<DigestData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchDigest = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/digest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    deptId: departmentId,
                    date: date?.toISOString(),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch digest');
            }

            const data = await response.json();
            setDigest(data.details);
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes('not enabled')) {
                setError('Manager Digest is not enabled yet. Complete setup in Settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                        <AlertTriangle className="h-5 w-5" />
                        Manager Digest Unavailable
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">{error}</p>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/settings/ai-advisory">Configure AI Features</a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!digest) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        Manager Digest
                    </CardTitle>
                    <CardDescription>
                        AI-powered team overview and insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={fetchDigest} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing team...
                            </>
                        ) : (
                            <>
                                <Brain className="h-4 w-4 mr-2" />
                                Generate Team Digest
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const reportRateColor = digest.metrics.reportRate >= 0.8 ? 'text-green-600' :
        digest.metrics.reportRate >= 0.5 ? 'text-amber-600' :
            'text-red-600';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Manager Digest
                </CardTitle>
                <CardDescription>{digest.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Metrics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="text-xs text-slate-500">Team Size</span>
                        </div>
                        <p className="text-lg font-semibold">{digest.metrics.teamSize}</p>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600">Reports</span>
                        </div>
                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                            {digest.metrics.reportsSubmitted}
                        </p>
                    </div>

                    <div className={`p-3 rounded-lg ${digest.metrics.reportRate >= 0.8 ? 'bg-green-50 dark:bg-green-900/20' :
                            digest.metrics.reportRate >= 0.5 ? 'bg-amber-50 dark:bg-amber-900/20' :
                                'bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className={`h-4 w-4 ${reportRateColor}`} />
                            <span className={`text-xs ${reportRateColor}`}>Report Rate</span>
                        </div>
                        <p className={`text-lg font-semibold ${reportRateColor}`}>
                            {Math.round(digest.metrics.reportRate * 100)}%
                        </p>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-xs text-amber-600">Need Attention</span>
                        </div>
                        <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                            {digest.metrics.needingAttention}
                        </p>
                    </div>
                </div>

                {/* People Needing Attention */}
                {digest.peopleNeedingAttention && digest.peopleNeedingAttention.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            People Needing Attention
                        </h4>
                        <div className="space-y-2">
                            {digest.peopleNeedingAttention.map((person) => (
                                <div
                                    key={person.userId}
                                    className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-amber-900 dark:text-amber-100">
                                                {person.name}
                                            </p>
                                            {person.role && (
                                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                                    {person.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {person.reasons.map((reason, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm">
                                                <span className="text-amber-600">‣</span>
                                                <span className="text-amber-800 dark:text-amber-300">
                                                    {reason}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Highlights */}
                {digest.highlights && digest.highlights.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Highlights
                        </h4>
                        <div className="space-y-1">
                            {digest.highlights.map((highlight, idx) => (
                                <div
                                    key={idx}
                                    className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded"
                                >
                                    {highlight}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Concerns */}
                {digest.concerns && digest.concerns.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            Concerns
                        </h4>
                        <div className="space-y-1">
                            {digest.concerns.map((concern, idx) => (
                                <div
                                    key={idx}
                                    className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded"
                                >
                                    {concern}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchDigest}
                    disabled={loading}
                    className="w-full mt-3"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        'Refresh Digest'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
