"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAllDepartments, DepartmentArchetype, RoleArchetype, KPITemplate } from "@/lib/role-archetypes";
import { Loader2, Briefcase, Target } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface WizardJobRoleStepProps {
    departmentCode?: string;
    onComplete?: () => void;
}

export function WizardJobRoleStep({ departmentCode, onComplete }: WizardJobRoleStepProps) {
    const [departments, setDepartments] = useState<DepartmentArchetype[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>(departmentCode || "");
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const availableRoles = departments.find(d => d.code === selectedDepartment)?.roles || [];
    const currentRole = availableRoles.find(r => r.code === selectedRole);

    useEffect(() => {
        loadDepartmentsAndProfile();
    }, []);

    const loadDepartmentsAndProfile = async () => {
        try {
            const depts = await getAllDepartments();
            setDepartments(depts);

            // If department code was passed, use it
            if (departmentCode) {
                setSelectedDepartment(departmentCode);
            }

            // Try to load existing profile
            try {
                const profileRes = await api.get('/user-settings/profile');
                const profile = profileRes.data;

                if (profile?.roleArchetype) {
                    const roleArchetype = profile.roleArchetype;
                    const deptCode = roleArchetype.departmentArchetype?.code;
                    const roleCode = roleArchetype.code;

                    if (deptCode && roleCode) {
                        setSelectedDepartment(deptCode);
                        setSelectedRole(roleCode);
                    }
                }
            } catch (error) {
                // Profile doesn't exist yet, that's OK
            }
        } catch (error) {
            console.error("Failed to load departments:", error);
            toast.error("Failed to load department templates");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedRole) {
            toast.error("Please select a job role");
            return;
        }

        setSaving(true);
        try {
            const role = availableRoles.find(r => r.code === selectedRole);
            if (role) {
                await api.patch('/user-settings/role-archetype', {
                    roleArchetypeId: role.id
                });
                toast.success("Job role saved successfully!");
                onComplete?.();
            }
        } catch (error) {
            console.error("Failed to save role:", error);
            toast.error("Failed to save job role");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Select Your Job Role
                    </CardTitle>
                    <CardDescription>
                        Choose your department and role to get personalized KPIs and AI insights
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        {/* Department Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.code} value={dept.code}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Role Selection */}
                        {selectedDepartment && (
                            <div className="space-y-2">
                                <Label htmlFor="role">Job Role</Label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map(role => (
                                            <SelectItem key={role.code} value={role.code}>
                                                <div className="flex items-center gap-2">
                                                    <span>{role.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {role.level}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {currentRole?.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {currentRole.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* KPIs Display */}
                        {currentRole && currentRole.kpis && currentRole.kpis.length > 0 && (
                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                    <Label>Key Performance Indicators</Label>
                                </div>
                                <div className="grid gap-2">
                                    {currentRole.kpis.map((kpi: KPITemplate) => (
                                        <div key={kpi.code} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{kpi.name}</div>
                                                <div className="text-xs text-muted-foreground">{kpi.description}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {kpi.unit}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {kpi.frequency}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={!selectedRole || saving}
                        className="w-full"
                        size="lg"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save and Continue"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
