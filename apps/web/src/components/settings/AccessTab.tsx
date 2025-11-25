"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AccessLog {
    id: string;
    reason: string;
    scopes: string[];
    createdAt: string;
    expiresAt: string;
}

export function AccessTab() {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState("");
    const [targetId, setTargetId] = useState(""); // In a real app, this would be selected from a list or context

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const { data } = await api.get("/user-admin/access/logs");
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/user-admin/access/request-detail", {
                targetId: targetId || "self", // Default to self for testing if empty
                reason,
                durationMinutes: 60,
            });
            toast.success("Access requested and logged");
            setReason("");
            loadLogs();
        } catch (error) {
            console.error(error);
            toast.error("Failed to request access");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Request Detailed Access</CardTitle>
                    <CardDescription>
                        Request temporary access to sensitive data (e.g., full activity logs of another user).
                        This action will be logged and may require approval.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRequest} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="targetId">Target User ID (Optional for test)</Label>
                            <Input
                                id="targetId"
                                placeholder="Enter User ID or leave empty for self-test"
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Access</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Investigating performance issue..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit">Request Access</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Access History</CardTitle>
                    <CardDescription>Recent access requests and approvals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No access logs found.
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex flex-col p-4 border rounded-lg gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{log.reason}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(log.createdAt), "PPp")}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {log.scopes.map(scope => (
                                            <Badge key={scope} variant="outline" className="text-xs">
                                                {scope}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Expires: {format(new Date(log.expiresAt), "PPp")}
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
