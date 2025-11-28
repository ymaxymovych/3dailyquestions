import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Briefcase } from 'lucide-react';
import type { TeamMemberReport } from '@/lib/manager-dashboard';
import { format } from 'date-fns';

interface EmployeeReportCardProps {
    report: TeamMemberReport;
    onClick: () => void;
}

export function EmployeeReportCard({ report, onClick }: EmployeeReportCardProps) {
    const statusConfig = {
        submitted: {
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            label: 'Заповнено',
        },
        not_submitted: {
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            label: 'Не заповнено',
        },
    };

    const config = statusConfig[report.status];
    const StatusIcon = config.icon;

    const getBigTaskTitle = () => {
        if (!report.report?.todayBig) return null;
        const tasks = Array.isArray(report.report.todayBig) ? report.report.todayBig : [];
        return tasks.length > 0 ? tasks[0].title : null;
    };

    const bigTaskTitle = getBigTaskTitle();

    return (
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Left: Employee Info */}
                    <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                            {report.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{report.userName}</h3>
                                <Badge variant="outline" className="text-xs">
                                    {report.position}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{report.email}</p>

                            {/* Big Task */}
                            {bigTaskTitle && (
                                <div className="mt-2 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">{bigTaskTitle}</span>
                                </div>
                            )}

                            {/* No Big Task Warning */}
                            {report.status === 'submitted' && !bigTaskTitle && (
                                <div className="mt-2 flex items-center gap-2 text-orange-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">Немає Big-задачі</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Status & Indicators */}
                    <div className="flex flex-col items-end gap-2">
                        {/* Status Badge */}
                        <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full', config.bgColor)}>
                            <StatusIcon className={cn('h-4 w-4', config.color)} />
                            <span className={cn('text-sm font-medium', config.color)}>
                                {config.label}
                            </span>
                        </div>

                        {/* Submitted Time */}
                        {report.submittedAt && (
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(report.submittedAt), 'HH:mm')}
                            </span>
                        )}

                        {/* Risk Badge */}
                        {report.aiFlags && report.aiFlags.riskLevel !== 'none' && (
                            <Badge
                                variant={
                                    report.aiFlags.riskLevel === 'high' ? 'destructive' :
                                        report.aiFlags.riskLevel === 'medium' ? 'default' :
                                            'secondary'
                                }
                                className="text-xs"
                            >
                                {report.aiFlags.riskLevel === 'high' && '🔴 Високий ризик'}
                                {report.aiFlags.riskLevel === 'medium' && '🟠 Потрібна увага'}
                                {report.aiFlags.riskLevel === 'low' && '🟡 Незначні проблеми'}
                            </Badge>
                        )}

                        {/* Indicators */}
                        <div className="flex gap-2 mt-2">
                            {report.hasHelpRequest && (
                                <div className="flex items-center gap-1 text-orange-600">
                                    <HelpCircle className="h-4 w-4" />
                                    <span className="text-xs font-medium">{report.helpRequestsCount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Plan vs Fact (Yaware Integration) */}
                {report.integrationsSnapshot && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Фокус (Yaware)</span>
                            <span className="font-medium">
                                {Math.round(report.integrationsSnapshot.focusTimeMinutes / 60)}h {report.integrationsSnapshot.focusTimeMinutes % 60}m
                                <span className="text-muted-foreground mx-1">/</span>
                                {Math.round(report.integrationsSnapshot.plannedFocusMinutes / 60)}h
                            </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    report.integrationsSnapshot.focusTimePercentage >= 100 ? "bg-green-500" :
                                        report.integrationsSnapshot.focusTimePercentage >= 80 ? "bg-blue-500" :
                                            "bg-yellow-500"
                                )}
                                style={{ width: `${Math.min(report.integrationsSnapshot.focusTimePercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
