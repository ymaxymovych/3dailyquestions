'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getKpis, createKpi, deleteKpi, KPI } from '@/lib/user-settings';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function KpiSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<KPI[]>([]);
    const { register, handleSubmit, reset } = useForm<Omit<KPI, 'id' | 'userId'>>();

    useEffect(() => {
        loadKpis();
    }, []);

    const loadKpis = async () => {
        try {
            const data = await getKpis();
            setKpis(data);
        } catch (error) {
            toast.error('Failed to load KPIs');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: Omit<KPI, 'id' | 'userId'>) => {
        try {
            // Ensure targetValue is a number
            const payload = { ...data, targetValue: Number(data.targetValue) };
            await createKpi(payload);
            toast.success('KPI created');
            reset();
            loadKpis();
        } catch (error) {
            toast.error('Failed to create KPI');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await deleteKpi(id);
            toast.success('KPI deleted');
            loadKpis();
        } catch (error) {
            toast.error('Failed to delete KPI');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My KPIs</CardTitle>
                    <CardDescription>
                        Define the metrics you want to track for your performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kpis.map((kpi) => (
                                <TableRow key={kpi.id}>
                                    <TableCell className="font-medium">{kpi.name}</TableCell>
                                    <TableCell>{kpi.targetValue}</TableCell>
                                    <TableCell>{kpi.unit}</TableCell>
                                    <TableCell>{kpi.period}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(kpi.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {kpis.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No KPIs defined yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Add New KPI</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-5 items-end">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Name</Label>
                            <Input placeholder="e.g. Closed Tickets" {...register('name', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Target</Label>
                            <Input type="number" placeholder="10" {...register('targetValue', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input placeholder="tickets" {...register('unit', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Button type="submit" className="w-full">
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
