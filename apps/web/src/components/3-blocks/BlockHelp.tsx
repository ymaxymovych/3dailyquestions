import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockHelpProps {
    help: string;
    onHelpChange: (value: string) => void;
}

export default function BlockHelp({ help, onHelpChange }: BlockHelpProps) {
    const hasContent = help && help.trim().length > 0;

    return (
        <div className={cn(
            "space-y-6 p-6 rounded-xl border shadow-sm transition-colors",
            hasContent ? "bg-amber-50/30 border-amber-200" : "bg-card"
        )}>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className={cn("h-6 w-6", hasContent ? "text-amber-600" : "text-amber-500")} />
                    <h2 className="text-xl font-bold text-foreground">БЛОК 3: Яка допомога мені потрібна</h2>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Опишіть блокери або запити до колег/керівника.
                    </p>
                    <Textarea
                        value={help}
                        onChange={(e) => onHelpChange(e.target.value)}
                        placeholder={`Потрібне погодження hiring plan до 16:00.\nПотрібен доступ до нового репозиторію від DevOps.`}
                        className={cn(
                            "min-h-[120px] resize-none focus:ring-2 text-base leading-relaxed",
                            hasContent
                                ? "border-amber-200 focus:ring-amber-500 bg-white"
                                : "focus:ring-primary"
                        )}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                        Якщо блокерів немає, залиште порожнім або напишіть 'Все добре'.
                    </p>
                </div>
            </div>
        </div>
    );
}
