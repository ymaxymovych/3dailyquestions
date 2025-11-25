import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DailyReportKPI } from "@/lib/daily-reports";
import { KPITemplate } from "@/lib/role-archetypes";
import { Info } from "lucide-react";

interface KPIInputSectionProps {
    kpis: DailyReportKPI[];
    definitions: KPITemplate[];
    onChange: (kpis: DailyReportKPI[]) => void;
    type: 'fact' | 'plan'; // 'fact' for yesterday, 'plan' for today (goal)
}

export function KPIInputSection({ kpis, definitions, onChange, type }: KPIInputSectionProps) {
    if (!kpis || kpis.length === 0) return null;

    const handleValueChange = (index: number, val: string) => {
        const newKpis = [...kpis];
        const numVal = parseFloat(val);

        if (type === 'fact') {
            newKpis[index].value = isNaN(numVal) ? 0 : numVal;
        } else {
            newKpis[index].goal = isNaN(numVal) ? 0 : numVal;
        }

        onChange(newKpis);
    };

    return (
        <div className="space-y-3">
            <div className="grid gap-3">
                {kpis.map((kpi, index) => {
                    // Find definition for this KPI
                    const def = definitions.find(d => d.code === kpi.kpiCode);
                    if (!def) return null;

                    return (
                        <div key={kpi.kpiCode} className="flex items-center gap-3 p-2 bg-white/50 rounded-md border border-slate-100">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Label className="font-medium truncate" title={def.name}>
                                        {def.name}
                                    </Label>
                                    {def.description && (
                                        <div title={def.description}>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {def.frequency} • {def.direction === 'HIGHER_BETTER' ? 'Більше = краще' : 'Менше = краще'}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    className="w-20 text-right h-8"
                                    value={type === 'fact' ? (kpi.value || '') : (kpi.goal || '')}
                                    onChange={(e) => handleValueChange(index, e.target.value)}
                                    placeholder="0"
                                />
                                <Badge variant="secondary" className="w-16 justify-center text-xs h-8">
                                    {def.unit}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
