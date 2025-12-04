'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Plus, Pencil, Trash2, Users as UsersIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WizardBanner } from '@/components/wizard/WizardBanner';
import wizardApi from '@/lib/wizardApi';

interface Archetype {
    id: string;
    code: string;
    name: string;
    level: string;
    mission: string | null;
    departmentArchetype: {
        name: string;
    };
}

interface JobRole {
    id: string;
    name: string;
    level: string | null;
    mission: string | null;
    responsibilities: string[] | null;
    archetype: {
        id: string;
        code: string;
        name: string;
        level: string;
        departmentArchetype: {
            name: string;
        };
    };
    _count: {
        users: number;
    };
}

function RolesPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isWizardMode = searchParams.get('wizard') === 'true';

    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
    const [archetypes, setArchetypes] = useState<Archetype[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<JobRole | null>(null);

    // Form state
    const [roleName, setRoleName] = useState('');
    const [roleLevel, setRoleLevel] = useState('');
    const [roleMission, setRoleMission] = useState('');
    const [roleResponsibilities, setRoleResponsibilities] = useState('');
    const [selectedArchetypeId, setSelectedArchetypeId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, archetypesRes] = await Promise.all([
                fetch('/api/job-roles'),
                fetch('/api/archetypes'),
            ]);

            if (rolesRes.ok) setJobRoles(await rolesRes.json());
            if (archetypesRes.ok) setArchetypes(await archetypesRes.json());
        } catch (error) {
            console.error('Failed to fetch roles data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (role?: JobRole) => {
        if (role) {
            setEditingRole(role);
            setRoleName(role.name);
            setRoleLevel(role.level || '');
            setRoleMission(role.mission || '');
            setRoleResponsibilities(role.responsibilities?.join('\n') || '');
            setSelectedArchetypeId(role.archetype.id);
        } else {
            setEditingRole(null);
            setRoleName('');
            setRoleLevel('');
            setRoleMission('');
            setRoleResponsibilities('');
            setSelectedArchetypeId('');
        }
        setDialogOpen(true);
    };

    const handleArchetypeChange = (archetypeId: string) => {
        setSelectedArchetypeId(archetypeId);
        const archetype = archetypes.find((a) => a.id === archetypeId);
        if (archetype && !editingRole) {
            // Pre-fill with archetype data when creating new role
            setRoleName(archetype.name);
            setRoleLevel(archetype.level);
            setRoleMission(archetype.mission || '');
        }
    };

    const handleSave = async () => {
        try {
            const url = editingRole ? `/api/job-roles/${editingRole.id}` : '/api/job-roles';
            const method = editingRole ? 'PATCH' : 'POST';

            const responsibilities = roleResponsibilities
                .split('\n')
                .map((r) => r.trim())
                .filter((r) => r.length > 0);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: roleName,
                    level: roleLevel || null,
                    archetypeId: selectedArchetypeId,
                    mission: roleMission || null,
                    responsibilities: responsibilities.length > 0 ? responsibilities : null,
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Job role ${editingRole ? 'updated' : 'created'} successfully`,
                });
                setDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to save job role:', error);
            toast({
                title: 'Error',
                description: 'Failed to save job role',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job role?')) return;

        try {
            const response = await fetch(`/api/job-roles/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Job role deleted successfully' });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to delete job role:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete job role',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading job roles...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Job Roles</h1>
                <p className="text-muted-foreground mt-2">
                    Company-specific roles based on global archetypes. Assign these to employees.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Active Job Roles
                            </CardTitle>
                            <CardDescription>
                                Create roles from archetypes or customize your own
                            </CardDescription>
                        </div>
                        <Button onClick={() => openDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Job Role
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {jobRoles.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No job roles yet. Create roles based on archetypes to assign to employees.
                            </p>
                            <Button onClick={() => openDialog()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Role
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {jobRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{role.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="outline">{role.archetype.level}</Badge>
                                                <Badge variant="secondary">
                                                    {role.archetype.departmentArchetype.name}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDialog(role)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(role.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>

                                    {role.mission && (
                                        <p className="text-sm text-muted-foreground italic mb-3">
                                            "{role.mission}"
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                                        <div className="flex items-center gap-1">
                                            <UsersIcon className="h-4 w-4" />
                                            <span>
                                                {role._count.users} {role._count.users === 1 ? 'person' : 'people'}
                                            </span>
                                        </div>
                                        <div className="text-xs">
                                            Based on: {role.archetype.name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Job Role' : 'Create Job Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? 'Update job role details'
                                : 'Create a new company-specific job role from an archetype'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="archetype">Select Archetype *</Label>
                            <Select
                                value={selectedArchetypeId}
                                onValueChange={handleArchetypeChange}
                                disabled={!!editingRole}
                            >
                                <SelectTrigger id="archetype">
                                    <SelectValue placeholder="Choose a role archetype..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {archetypes.map((archetype) => (
                                        <SelectItem key={archetype.id} value={archetype.id}>
                                            {archetype.name} ({archetype.departmentArchetype.name}) - {archetype.level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editingRole && (
                                <p className="text-xs text-muted-foreground">
                                    Archetype cannot be changed after creation
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="roleName">Role Name *</Label>
                            <Input
                                id="roleName"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="e.g., Senior Frontend Engineer"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="roleLevel">Level</Label>
                            <Input
                                id="roleLevel"
                                value={roleLevel}
                                onChange={(e) => setRoleLevel(e.target.value)}
                                placeholder="e.g., Senior, Mid, Junior"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="roleMission">Mission Statement</Label>
                            <Textarea
                                id="roleMission"
                                value={roleMission}
                                onChange={(e) => setRoleMission(e.target.value)}
                                placeholder="What is the core purpose of this role?"
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="roleResponsibilities">
                                Key Responsibilities (one per line)
                            </Label>
                            <Textarea
                                id="roleResponsibilities"
                                value={roleResponsibilities}
                                onChange={(e) => setRoleResponsibilities(e.target.value)}
                                placeholder="Build and maintain web applications&#10;Collaborate with design team&#10;Code reviews and mentoring"
                                rows={5}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!roleName || !selectedArchetypeId}>
                            {editingRole ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isWizardMode && (
                <WizardBanner
                    currentStep={3}
                    totalSteps={5}
                    stepName="Job Roles"
                    onNext={async () => {
                        // Update status to move to next step
                        try {
                            await wizardApi.post('/setup/organization/status', { orgCurrentStep: 4 });
                            // For now, redirect to dashboard as step 4 might not be ready or just finish
                            // Assuming step 4 is Process/Routine
                            router.push('/settings/routine?wizard=true&step=4');
                        } catch (error) {
                            console.error('Failed to update wizard status', error);
                            router.push('/settings/routine?wizard=true&step=4');
                        }
                    }}
                    onBack={() => router.push('/settings/organization?wizard=true&step=2')}
                    className="lg:left-64"
                />
            )}
        </div>
    );
}

export default function RolesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading job roles...</div>
            </div>
        }>
            <RolesPageContent />
        </Suspense>
    );
}
