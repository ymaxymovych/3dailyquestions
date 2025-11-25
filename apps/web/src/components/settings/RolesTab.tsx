"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Role {
    id: string;
    name: string;
    description: string;
    scopes: string[];
    isSystem: boolean;
}

export function RolesTab() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const { data } = await api.get("/user-admin/roles");
            setRoles(data);
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
                <CardHeader>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>Manage system roles and access scopes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {roles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No roles defined.
                            </div>
                        ) : (
                            roles.map((role) => (
                                <div key={role.id} className="flex flex-col p-4 border rounded-lg gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{role.name}</span>
                                            {role.isSystem && <Badge variant="secondary">System</Badge>}
                                        </div>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{role.description}</div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {role.scopes.map(scope => (
                                            <Badge key={scope} variant="outline" className="text-xs font-mono">
                                                {scope}
                                            </Badge>
                                        ))}
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
