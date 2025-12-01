import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export interface StructuredTasks {
    bigTask: string;
    mediumTasks: string;
    smallTasks: string;
    metrics?: string; // Added for Today's plan which stores metrics in JSON
}

interface BlockYesterdayProps {
    tasks: StructuredTasks;
    metrics: string; // Yesterday metrics are stored in a separate DB column
    onTasksChange: (value: StructuredTasks) => void;
    onMetricsChange: (value: string) => void;
}

export default function BlockYesterday({ tasks, metrics, onTasksChange, onMetricsChange }: BlockYesterdayProps) {
    const handleChange = (field: keyof StructuredTasks, value: string) => {
        onTasksChange({
            ...tasks,
            [field]: value
        });
    };

    return (
        <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Звіт за вчора</h2>

                    <div className="space-y-6">
                        {/* Big Task */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Одна Велика справа (2–4 години):</Label>
                            <Input
                                value={tasks.bigTask}
                                onChange={(e) => handleChange('bigTask', e.target.value)}
                                placeholder="Завершив інтеграцію API для модуля звітів..."
                                className="h-10 text-base"
                            />
                        </div>

                        {/* Medium Tasks */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">3–5 середніх справ (по 20–60 хв кожна):</Label>
                            <Textarea
                                value={tasks.mediumTasks}
                                onChange={(e) => handleChange('mediumTasks', e.target.value)}
                                placeholder={`Провів код-рев'ю для PR #123\nВідповів на важливі листи клієнтів\nСинхронізація з командою дизайну`}
                                className="min-h-[100px] text-base resize-y"
                            />
                        </div>

                        {/* Small Tasks */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Дрібні справи (просто список):</Label>
                            <Textarea
                                value={tasks.smallTasks}
                                onChange={(e) => handleChange('smallTasks', e.target.value)}
                                placeholder={`Дейлі мітинг\nЗаповнив таймшит\nВідповів в слаку`}
                                className="min-h-[80px] text-base resize-y"
                            />
                        </div>

                        {/* Metrics */}
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Метрики за вчора (цифрами):</Label>
                            <Textarea
                                value={metrics}
                                onChange={(e) => onMetricsChange(e.target.value)}
                                placeholder={`Продажі: 2 угоди\nНові ліди: 5\nДзвінки: 12`}
                                className="min-h-[80px] text-base resize-y"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
