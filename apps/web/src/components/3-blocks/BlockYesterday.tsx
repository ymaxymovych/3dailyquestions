import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BlockYesterdayProps {
    tasks: string;
    metrics: string;
    onTasksChange: (value: string) => void;
    onMetricsChange: (value: string) => void;
}

export default function BlockYesterday({ tasks, metrics, onTasksChange, onMetricsChange }: BlockYesterdayProps) {
    return (
        <div className="space-y-6 p-6 bg-card rounded-xl border shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-foreground mb-4">БЛОК 1: Звіт за вчора</h2>

                <div className="space-y-4">
                    <div>
                        <Label className="text-lg font-semibold mb-2 block">Що я зробив:</Label>
                        <Textarea
                            value={tasks}
                            onChange={(e) => onTasksChange(e.target.value)}
                            placeholder={`Завершив дизайн нової фічі для клієнта X\nПровів 3 інтерв'ю з кандидатами\nВиправив критичний баг у модулі оплати`}
                            className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary text-base leading-relaxed"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Опишіть конкретні результати, а не процеси. Кожна задача з нового рядка.
                        </p>
                    </div>

                    <div>
                        <Label className="text-lg font-semibold mb-2 block mt-6">Метрики за вчора (цифрами):</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                            Напишіть коротко, які результати ви отримали вчора. Формат: Назва метрики: число
                        </p>
                        <Textarea
                            value={metrics}
                            onChange={(e) => onMetricsChange(e.target.value)}
                            placeholder={`Продажі: 2 угоди\nНові ліди: 15\nДзвінки клієнтам: 18`}
                            className="min-h-[100px] resize-none focus:ring-2 focus:ring-primary text-base leading-relaxed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
