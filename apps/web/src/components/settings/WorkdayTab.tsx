"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import api from "@/lib/api";

interface WorkdayForm {
    timezone: string;
    start: string;
    end: string;
    breakMinutes: number;
    workDays: number[]; // 1=Mon, 7=Sun
}

export function WorkdayTab() {
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, setValue, watch } = useForm<WorkdayForm>();
    const workDays = watch("workDays") || [];

    useEffect(() => {
        loadWorkday();
    }, []);

    const loadWorkday = async () => {
        try {
            const { data } = await api.get("/user-admin/profile");
            if (data.workday) {
                reset(data.workday);
            } else {
                // Defaults
                reset({
                    timezone: "Europe/Kyiv",
                    start: "09:00",
                    end: "18:00",
                    breakMinutes: 60,
                    workDays: [1, 2, 3, 4, 5],
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const reset = (values: WorkdayForm) => {
        setValue("timezone", values.timezone);
        setValue("start", values.start);
        setValue("end", values.end);
        setValue("breakMinutes", values.breakMinutes);
        setValue("workDays", values.workDays);
    }

    const onSubmit = async (values: WorkdayForm) => {
        try {
            await api.put("/user-admin/profile/workday", values);
            toast.success("Workday settings updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update workday settings");
        }
    };

    const toggleDay = (day: number) => {
        const current = workDays;
        if (current.includes(day)) {
            setValue("workDays", current.filter(d => d !== day));
        } else {
            setValue("workDays", [...current, day].sort());
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Work Schedule</CardTitle>
                    <CardDescription>Define your typical working hours and days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input id="timezone" {...register("timezone")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="breakMinutes">Break Duration (min)</Label>
                                <Input type="number" id="breakMinutes" {...register("breakMinutes", { valueAsNumber: true })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start">Start Time</Label>
                                <Input type="time" id="start" {...register("start")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">End Time</Label>
                                <Input type="time" id="end" {...register("end")} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Working Days</Label>
                            <div className="flex gap-4">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`day-${index + 1}`}
                                            checked={workDays.includes(index + 1)}
                                            onCheckedChange={() => toggleDay(index + 1)}
                                        />
                                        <Label htmlFor={`day-${index + 1}`}>{day}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit">Save Schedule</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
