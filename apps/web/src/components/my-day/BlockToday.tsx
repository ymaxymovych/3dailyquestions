import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { StructuredTasks } from "./BlockYesterday";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BlockTodayProps {
    plan: StructuredTasks;
    onPlanChange: (value: StructuredTasks) => void;
}

export default function BlockToday({ plan, onPlanChange }: BlockTodayProps) {
    const handleChange = (field: keyof StructuredTasks, value: string) => {
        onPlanChange({
            ...plan,
            [field]: value
        });
    };

    return (
        <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-foreground">План на сьогодні</h2>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p>Час вказуйте в дужках, наприклад: (45 хв), або діапазон 10:00-13:00, якщо бажаєте забронювати точний час.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="space-y-6">
                        {/* Big Task */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Одна Велика справа (2–4 години):</Label>
                            <Input
                                value={plan.bigTask}
                                onChange={(e) => handleChange('bigTask', e.target.value)}
                                placeholder="Finalize hiring plan for Q1 (10:00-13:00)"
                                className="h-10 text-base"
                            />
                        </div>

                        {/* Medium Tasks */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">3–5 середніх справ (по 20–60 хв кожна):</Label>
                            <Textarea
                                value={plan.mediumTasks}
                                onChange={(e) => handleChange('mediumTasks', e.target.value)}
                                placeholder={`Підготувати оновлення для клієнта X (45 хв)\nПеревірити 10 лідів з LinkedIn (30 хв)\nПеревірити 10 лідів в CRM (14:00-14:30)`}
                                className="min-h-[100px] text-base resize-y"
                            />
                        </div>

                        {/* Small Tasks */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Дрібні справи (просто список):</Label>
                            <Textarea
                                value={plan.smallTasks}
                                onChange={(e) => handleChange('smallTasks', e.target.value)}
                                placeholder={`Відповісти на 3 емейли від клієнтів (15 хв)\nОновити опис задачі в Jira (20 хв)`}
                                className="min-h-[80px] text-base resize-y"
                            />
                        </div>

                        {/* Today Metrics */}
                        <div className="space-y-2 pt-2">
                            <Label className="text-base font-semibold">Очікувані метрики за сьогодні:</Label>
                            <Textarea
                                value={plan.metrics || ''}
                                onChange={(e) => handleChange('metrics', e.target.value)}
                                placeholder={`Отримати 3 підтвердження від кандидатів\nЗакрити угоду з компанією Y`}
                                className="min-h-[80px] text-base resize-y"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
