import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Briefcase, HelpCircle } from 'lucide-react';
import type { TeamSummary } from '@/lib/manager-dashboard';

interface DashboardSummaryProps {
    summary: TeamSummary;
    onFilterClick?: (filterType: 'submitted' | 'highRisk' | 'needsAttention' | 'bigTask') => void;
}

export function DashboardSummary({ summary, onFilterClick }: DashboardSummaryProps) {
    const stats = [
        {
            label: 'Заповнили звіт',
            value: `${summary.completionRate}%`,
            detail: `${summary.submitted} з ${summary.totalMembers}`,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            filterType: 'submitted' as const,
        },
        {
            label: 'Високий ризик',
            value: summary.highRisk || 0,
            detail: summary.highRisk === 1 ? 'співробітник' : 'співробітників',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            filterType: 'highRisk' as const,
        },
        {
            label: 'Потрібна увага',
            value: summary.needsAttention || 0,
            detail: 'середній/високий ризик',
            icon: HelpCircle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            filterType: 'needsAttention' as const,
        },
        {
            label: 'З Big-задачею',
            value: summary.withBigTask,
            detail: `з ${summary.submitted} звітів`,
            icon: Briefcase,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            filterType: 'bigTask' as const,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.label}
                        className={cn(
                            "transition-all",
                            onFilterClick && "cursor-pointer hover:shadow-lg hover:scale-105"
                        )}
                        onClick={() => onFilterClick?.(stat.filterType)}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.detail}
                                    </p>
                                </div>
                                <div className={cn('p-3 rounded-full', stat.bgColor)}>
                                    <Icon className={cn('h-6 w-6', stat.color)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
