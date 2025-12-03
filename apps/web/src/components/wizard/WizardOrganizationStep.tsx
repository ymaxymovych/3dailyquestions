"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { getAllDepartments, DepartmentArchetype } from "@/lib/role-archetypes";
import { Loader2, Building2, Sparkles, Wrench, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardOrganizationStepProps {
    onComplete?: (archetypeCode?: string) => void;
    disableCustomRedirect?: boolean;
}

export function WizardOrganizationStep({ onComplete, disableCustomRedirect }: WizardOrganizationStepProps) {
    const [mode, setMode] = useState<'archetype' | 'custom'>('archetype');
    const [departments, setDepartments] = useState<DepartmentArchetype[]>([]);
    const [selectedArchetype, setSelectedArchetype] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const depts = await getAllDepartments();
            setDepartments(depts);
            if (depts.length > 0) {
                setSelectedArchetype(depts[0].code);
            }
        } catch (error) {
            console.error("Failed to load departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (mode === 'archetype' && selectedArchetype) {
            onComplete?.(selectedArchetype);
        } else if (mode === 'custom') {
            if (disableCustomRedirect) {
                // Let parent handle custom mode
                onComplete?.(undefined);
            } else {
                // Redirect to custom organization setup
                window.location.href = '/settings/organization?wizard=true&step=2';
            }
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
            {/* Mode Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Choose Setup Method</CardTitle>
                    <CardDescription>
                        Select how you want to structure your organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={mode} onValueChange={(value: string) => setMode(value as 'archetype' | 'custom')}>
                        <div className="space-y-3">
                            {/* Archetype Option */}
                            <div
                                className={cn(
                                    "flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                                    mode === 'archetype'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                                onClick={() => setMode('archetype')}
                            >
                                <RadioGroupItem value="archetype" id="archetype" className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <Label htmlFor="archetype" className="font-semibold cursor-pointer">
                                            Use Department Templates
                                        </Label>
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Choose from pre-configured department types (Sales, Marketing, Engineering, etc.)
                                        with built-in role templates and KPIs
                                    </p>
                                </div>
                            </div>

                            {/* Custom Option */}
                            <div
                                className={cn(
                                    "flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                                    mode === 'custom'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                )}
                                onClick={() => setMode('custom')}
                            >
                                <RadioGroupItem value="custom" id="custom" className="mt-1" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Wrench className="h-4 w-4 text-muted-foreground" />
                                        <Label htmlFor="custom" className="font-semibold cursor-pointer">
                                            Create Custom Structure
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Build your own departments and teams from scratch with full customization
                                    </p>
                                </div>
                            </div>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Archetype Selection */}
            {mode === 'archetype' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Select Department Type
                        </CardTitle>
                        <CardDescription>
                            Choose the department archetype that best matches your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {departments.map((dept) => (
                                <div
                                    key={dept.code}
                                    className={cn(
                                        "flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                                        selectedArchetype === dept.code
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                                    )}
                                    onClick={() => setSelectedArchetype(dept.code)}
                                >
                                    <div className="mt-0.5">
                                        {selectedArchetype === dept.code ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{dept.name}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {dept.roles?.length || 0} roles
                                            </Badge>
                                        </div>
                                        {dept.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {dept.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Continue Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleContinue}
                    disabled={mode === 'archetype' && !selectedArchetype}
                    size="lg"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
