"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

interface KPI {
    id: string;
    definition: {
        name: string;
        unit: string;
        period: string;
    };
    targetValue: number;
    status: string;
}

export function KPITab() {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKpis();
    }, []);

    const loadKpis = async () => {
        try {
            const { data } = await api.get("/user-admin/kpi/my");
            setKpis(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My KPIs</CardTitle>
                        <CardDescription>Key Performance Indicators assigned to you.</CardDescription>
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Propose KPI
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {kpis.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No KPIs assigned yet.
                            </div>
                        ) : (
                            kpis.map((kpi) => (
                                <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{kpi.definition.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Target: {kpi.targetValue} {kpi.definition.unit} / {kpi.definition.period}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            {kpi.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
