import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { TeamMemberReport } from '@/lib/manager-dashboard';
import { Briefcase, Target, AlertTriangle, HelpCircle } from 'lucide-react';

interface ReportDetailsModalProps {
    employee: TeamMemberReport;
    onClose: () => void;
}

export function ReportDetailsModal({ employee, onClose }: ReportDetailsModalProps) {
    if (!employee.report) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{employee.userName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center text-muted-foreground">
                        Звіт за цей день не надійшов
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const report = employee.report;

    const renderTasks = (tasks: any, label: string) => {
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            return <p className="text-sm text-muted-foreground">Немає задач</p>;
        }

        return (
            <ul className="space-y-2">
                {tasks.map((task: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-sm font-medium min-w-[60px]">
                            {task.timeboxH}h
                        </span>
                        <span className="text-sm flex-1">{task.title}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderSmallTasks = (small: any) => {
        if (!small || !small.items || small.items.length === 0) {
            return <p className="text-sm text-muted-foreground">Немає дрібних задач</p>;
        }

        return (
            <ul className="space-y-1">
                {small.items.map((item: string, index: number) => (
                    <li key={index} className="text-sm">• {item}</li>
                ))}
            </ul>
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">{employee.userName}</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {employee.position} • {employee.email}
                            </p>
                        </div>
                        <Badge variant={employee.status === 'submitted' ? 'default' : 'destructive'}>
                            {employee.status === 'submitted' ? 'Заповнено' : 'Не заповнено'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* AI Insights */}
                    {employee.aiFlags && employee.aiFlags.riskLevel !== 'none' && (
                        <Card className="border-purple-200 dark:border-purple-800">
                            <CardHeader className="bg-purple-50 dark:bg-purple-900/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-100">
                                    🤖 AI Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Рівень ризику:</span>
                                    <Badge
                                        variant={
                                            employee.aiFlags.riskLevel === 'high' ? 'destructive' :
                                                employee.aiFlags.riskLevel === 'medium' ? 'default' :
                                                    'secondary'
                                        }
                                    >
                                        {employee.aiFlags.riskLevel === 'high' && '🔴 Високий'}
                                        {employee.aiFlags.riskLevel === 'medium' && '🟠 Середній'}
                                        {employee.aiFlags.riskLevel === 'low' && '🟡 Низький'}
                                    </Badge>
                                </div>

                                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                        💡 Рекомендація для менеджера:
                                    </p>
                                    <p className="text-sm mt-1">{employee.aiFlags.suggestion}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {employee.aiFlags.hasBlocker && (
                                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                            ⚠️ Є блокер
                                        </div>
                                    )}
                                    {employee.aiFlags.noBigTask && (
                                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                            📋 Немає Big задачі ({employee.aiFlags.noBigTaskDays} днів)
                                        </div>
                                    )}
                                    {employee.aiFlags.overloaded && (
                                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                            📊 Перевантажений
                                        </div>
                                    )}
                                    {employee.aiFlags.notSubmittedDays > 0 && (
                                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                            ❌ Не заповнює звіти ({employee.aiFlags.notSubmittedDays} днів)
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Integrations Data */}
                    {employee.integrationsSnapshot && employee.integrationsSnapshot.plannedFocusMinutes > 0 && (
                        <Card className="border-cyan-200 dark:border-cyan-800">
                            <CardHeader className="bg-cyan-50 dark:bg-cyan-900/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-cyan-700 dark:text-cyan-100">
                                    📊 Дані з інтеграцій
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {/* Plan vs Fact */}
                                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                                    <h4 className="font-semibold mb-3">Фокус-тайм (Plan vs Fact)</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Заплановано</p>
                                            <p className="text-lg font-bold">
                                                {Math.floor(employee.integrationsSnapshot.plannedFocusMinutes / 60)}г {employee.integrationsSnapshot.plannedFocusMinutes % 60}хв
                                            </p>
                                            <p className="text-xs text-muted-foreground">Calendar</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Фактично</p>
                                            <p className="text-lg font-bold">
                                                {Math.floor(employee.integrationsSnapshot.focusTimeMinutes / 60)}г {employee.integrationsSnapshot.focusTimeMinutes % 60}хв
                                            </p>
                                            <p className="text-xs text-muted-foreground">Yaware</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Виконання</p>
                                            <p className={`text-lg font-bold ${employee.integrationsSnapshot.focusTimePercentage >= 100 ? 'text-green-600 dark:text-green-400' :
                                                    employee.integrationsSnapshot.focusTimePercentage >= 70 ? 'text-orange-600 dark:text-orange-400' :
                                                        'text-red-600 dark:text-red-400'
                                                }`}>
                                                {employee.integrationsSnapshot.focusTimePercentage}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {employee.integrationsSnapshot.focusTimeDelta >= 0 ? '+' : ''}
                                                {Math.floor(Math.abs(employee.integrationsSnapshot.focusTimeDelta) / 60)}г {Math.abs(employee.integrationsSnapshot.focusTimeDelta) % 60}хв
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Calendar Blocks */}
                                {employee.integrationsSnapshot.calendarBlocks.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Заплановані фокус-блоки (Calendar)</h4>
                                        <ul className="space-y-2">
                                            {employee.integrationsSnapshot.calendarBlocks.map((block, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium min-w-[100px]">
                                                        {block.start} - {block.end}
                                                    </span>
                                                    <span className="flex-1">{block.title}</span>
                                                    <span className="text-muted-foreground">
                                                        {block.durationMinutes} хв
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Yaware Data */}
                                {employee.integrationsSnapshot.yawareData && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Продуктивність (Yaware)</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded">
                                                <p className="text-muted-foreground">Productive Time</p>
                                                <p className="text-lg font-bold">
                                                    {Math.floor(employee.integrationsSnapshot.yawareData.productiveTimeMinutes / 60)}г {employee.integrationsSnapshot.yawareData.productiveTimeMinutes % 60}хв
                                                </p>
                                            </div>
                                            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded">
                                                <p className="text-muted-foreground">Focus Time</p>
                                                <p className="text-lg font-bold">
                                                    {Math.floor(employee.integrationsSnapshot.yawareData.focusTimeMinutes / 60)}г {employee.integrationsSnapshot.yawareData.focusTimeMinutes % 60}хв
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Yesterday Section */}
                    <Card>
                        <CardHeader className="bg-blue-50 dark:bg-blue-900/50">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-blue-100">
                                <Briefcase className="h-5 w-5" />
                                A. Що я зробив учора
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Велика справа (Main Focus)</h4>
                                {renderTasks(report.yesterdayBig, 'Big')}
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold mb-2">Інші важливі справи</h4>
                                {renderTasks(report.yesterdayMedium, 'Medium')}
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold mb-2">Дріб'язок (списком)</h4>
                                {renderSmallTasks(report.yesterdaySmall)}
                            </div>

                            {report.yesterdayNote && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold mb-2">Додаткові примітки</h4>
                                        <p className="text-sm whitespace-pre-wrap">{report.yesterdayNote}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Today Section */}
                    <Card>
                        <CardHeader className="bg-green-50 dark:bg-green-900/50">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-green-100">
                                <Target className="h-5 w-5" />
                                B. План на сьогодні
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Головний фокус (1 справа)</h4>
                                {renderTasks(report.todayBig, 'Big')}
                                {(!report.todayBig || report.todayBig.length === 0) && (
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mt-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Немає Big-задачі!</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold mb-2">Інші справи (2-3 шт)</h4>
                                {renderTasks(report.todayMedium, 'Medium')}
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold mb-2">Дріб'язок / Рутина</h4>
                                {renderSmallTasks(report.todaySmall)}
                            </div>

                            {report.todayNote && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold mb-2">Додаткові цілі</h4>
                                        <p className="text-sm whitespace-pre-wrap">{report.todayNote}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Help Requests */}
                    {report.helpRequests && report.helpRequests.length > 0 && (
                        <Card className="border-orange-200 dark:border-orange-800">
                            <CardHeader className="bg-orange-50 dark:bg-orange-900/50">
                                <CardTitle className="text-lg flex items-center gap-2 text-orange-700 dark:text-orange-100">
                                    <HelpCircle className="h-5 w-5" />
                                    Потрібна допомога / Блокери
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3">
                                    {report.helpRequests.map((req: any, index: number) => (
                                        <li key={index} className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                            <p className="text-sm font-medium">{req.text}</p>
                                            {req.link && (
                                                <a
                                                    href={req.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                                                >
                                                    {req.link}
                                                </a>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <Badge variant="outline">{req.priority}</Badge>
                                                <span>До: {new Date(req.dueDate).toLocaleDateString('uk-UA')}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mood & Wellbeing */}
                    {(report.mood || report.wellbeing) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Самопочуття та Блокери</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {report.mood && (
                                    <div>
                                        <span className="text-sm font-medium">Настрій / Енергія: </span>
                                        <span className="text-sm">{report.mood}/5</span>
                                    </div>
                                )}
                                {report.wellbeing && (
                                    <div>
                                        <span className="text-sm font-medium">Нотатки: </span>
                                        <span className="text-sm">{report.wellbeing}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
