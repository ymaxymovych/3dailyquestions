'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, AlertCircle, TrendingUp } from 'lucide-react';

interface AIMentorCardProps {
    userId: string;
    date?: Date;
}

interface MentorAdvice {
    actions: string[];
    warnings: string[];
    insights: string[];
    mainFocus: string;
    summary: string;
}

export function AIMentorCard({ userId, date }: AIMentorCardProps) {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<MentorAdvice | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAdvice = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: date?.toISOString() }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch advice');
            }

            const data = await response.json();
            setAdvice(data.advice.content);
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes('not enabled')) {
                setError('AI Mentor is not enabled yet. Complete setup in Settings.');
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
                        <AlertCircle className="h-5 w-5" />
                        AI Mentor Unavailable
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

    if (!advice) {
        return (
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Mentor
                    </CardTitle>
                    <CardDescription>
                        Get personalized advice for your day
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={fetchAdvice} disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Get AI Advice
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Mentor
                </CardTitle>
                <CardDescription>{advice.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Focus */}
                {advice.mainFocus && advice.mainFocus !== 'Not set' && (
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                                Main Focus
                            </span>
                        </div>
                        <p className="text-sm text-purple-800 dark:text-purple-300">
                            {advice.mainFocus}
                        </p>
                    </div>
                )}

                {/* Top 3 Actions */}
                {advice.actions && advice.actions.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Top 3 Actions
                        </h4>
                        <ul className="space-y-2">
                            {advice.actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <Badge variant="secondary" className="mt-0.5">
                                        {idx + 1}
                                    </Badge>
                                    <span className="text-sm flex-1">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Warnings */}
                {advice.warnings && advice.warnings.length > 0 && (
                    <div className="space-y-1">
                        {advice.warnings.map((warning, idx) => (
                            <div
                                key={idx}
                                className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded"
                            >
                                {warning}
                            </div>
                        ))}
                    </div>
                )}

                {/* Insights */}
                {advice.insights && advice.insights.length > 0 && (
                    <div className="space-y-1">
                        {advice.insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded"
                            >
                                {insight}
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchAdvice}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        'Refresh Advice'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
