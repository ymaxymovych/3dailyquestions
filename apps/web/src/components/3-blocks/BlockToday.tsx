import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BlockTodayProps {
    plan: string;
    onPlanChange: (value: string) => void;
}

export default function BlockToday({ plan, onPlanChange }: BlockTodayProps) {
    return (
        <div className="space-y-6 p-6 bg-card rounded-xl border shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-foreground mb-4">БЛОК 2: План на сьогодні</h2>

                <div>
                    <Label className="text-lg font-semibold mb-2 block">Задачі на день:</Label>
                    <Textarea
                        value={plan}
                        onChange={(e) => onPlanChange(e.target.value)}
                        placeholder={`Фінальна презентація проекту для стейкхолдерів (10:00-11:00)\nКод-рев'ю для команди (2 години)\nПідготувати звіт по метриках за тиждень`}
                        className="min-h-[150px] resize-none focus:ring-2 focus:ring-primary text-base leading-relaxed"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                        Вкажіть 3-5 ключових задач на день. Додайте часові рамки для важливих зустрічей.
                    </p>
                </div>
            </div>
        </div>
    );
}
