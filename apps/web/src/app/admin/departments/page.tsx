'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Users, Loader2, UserPlus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Types
interface DepartmentArchetype {
    id: string;
    code: string;
    name: string;
    description: string;
    roles: RoleArchetype[];
}

interface RoleArchetype {
    id: string;
    code: string;
    name: string;
    level: string;
}

interface Department {
    id: string;
    name: string;
    archetypeId: string | null;
    archetype?: DepartmentArchetype;
    managerId: string | null;
    hrId: string | null;
    _count: {
        users: number;
        projects: number;
    };
}

interface User {
    id: string;
    email: string;
    fullName: string;
    deptId: string | null;
    roleArchetype?: {
        name: string;
        code: string;
    };
}

export default function DepartmentsPage() {
    const { user } = useAuth();

    // State
    const [departments, setDepartments] = useState<Department[]>([]);
    const [archetypes, setArchetypes] = useState<DepartmentArchetype[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Create/Edit Dialog State
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1); // 1: Type, 2: Details
    const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('');
    const [deptName, setDeptName] = useState('');
    const [saving, setSaving] = useState(false);

    // Assign User Dialog State
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');

    // Fetch Data
    const fetchData = async () => {
        try {
            console.log('Fetching data...');

            // Fetch departments
            try {
                const deptsRes = await api.get('/departments');
                console.log('Departments:', deptsRes.data);
                setDepartments(deptsRes.data);
            } catch (e) {
                console.error('Failed to fetch departments', e);
                toast.error('Failed to load departments');
            }

            // Fetch archetypes
            try {
                const archRes = await api.get('/departments/archetypes');
                console.log('Archetypes:', archRes.data);
                setArchetypes(archRes.data);
            } catch (e) {
                console.error('Failed to fetch archetypes', e);
                toast.error('Failed to load templates');
            }

            // Fetch users
            try {
                const usersRes = await api.get('/departments/users-available');
                console.log('Users:', usersRes.data);
                setUsers(usersRes.data);
            } catch (e) {
                console.error('Failed to fetch users', e);
                // Don't show error toast here as it's not critical for page load
            }

        } catch (error) {
            console.error('General fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate unassigned employees
    const unassignedCount = users.filter(u => !u.deptId).length;

    // Handlers
    const handleCreateOpen = () => {
        setCreateStep(1);
        setSelectedArchetypeId('');
        setDeptName('');
        setCreateDialogOpen(true);
    };

    const handleCreateNext = () => {
        if (!selectedArchetypeId && selectedArchetypeId !== 'custom') return;

        // Auto-fill name based on archetype if empty
        if (!deptName && selectedArchetypeId !== 'custom') {
            const arch = archetypes.find(a => a.id === selectedArchetypeId);
            if (arch) setDeptName(arch.name);
        }

        setCreateStep(2);
    };

    const handleCreateSave = async () => {
        if (!deptName.trim()) return;

        setSaving(true);
        try {
            await api.post('/departments', {
                name: deptName,
                archetypeId: selectedArchetypeId === 'custom' ? null : selectedArchetypeId
            });

            toast.success('Department created successfully');
            setCreateDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create department');
        } finally {
            setSaving(false);
        }
    };

    const handleAssignOpen = (dept: Department) => {
        setSelectedDept(dept);
        setSelectedUserId('');
        setSelectedRoleId('');
        setAssignDialogOpen(true);
    };

    const handleAssignSave = async () => {
        if (!selectedDept || !selectedUserId) return;

        setSaving(true);
        try {
            await api.post(`/departments/${selectedDept.id}/assign-user`, {
                userId: selectedUserId,
                roleArchetypeId: selectedRoleId || undefined
            });

            toast.success('User assigned successfully');
            setAssignDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (dept: Department) => {
        if (!confirm(`Delete ${dept.name}?`)) return;

        try {
            await api.delete(`/departments/${dept.id}`);
            toast.success('Department deleted');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                    <p className="text-muted-foreground">
                        Manage organization structure and roles
                    </p>
                </div>
                <Button onClick={handleCreateOpen}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
            </div>

            {/* Unassigned Employees Alert */}
            {unassignedCount > 0 && (
                <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">
                        Unassigned Employees
                    </AlertTitle>
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                        {unassignedCount} {unassignedCount === 1 ? 'employee is' : 'employees are'} not assigned to any department.
                        <Link href="/admin/team?filter=unassigned" className="ml-2 underline font-medium">
                            View and assign →
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No departments found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                departments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <Link
                                                    href={`/admin/departments/${dept.id}`}
                                                    className="hover:underline text-primary"
                                                >
                                                    {dept.name}
                                                </Link>
                                                {dept.archetype && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {dept.archetype.description}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {dept.archetype ? (
                                                <Badge variant="secondary">
                                                    {dept.archetype.name}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Custom</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {dept._count.users}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {dept._count.projects}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAssignOpen(dept)}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Assign
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(dept)}
                                                    disabled={dept._count.users > 0}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Department Wizard */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Department</DialogTitle>
                        <DialogDescription>
                            {createStep === 1
                                ? 'Choose a department template to automatically configure roles and KPIs.'
                                : 'Configure department details.'}
                        </DialogDescription>
                    </DialogHeader>

                    {createStep === 1 ? (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-2">
                                {archetypes.map((arch) => (
                                    <div
                                        key={arch.id}
                                        className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedArchetypeId === arch.id ? 'border-primary bg-accent' : ''
                                            }`}
                                        onClick={() => setSelectedArchetypeId(arch.id)}
                                    >
                                        <div className="font-medium">{arch.name}</div>
                                        <div className="text-sm text-muted-foreground">{arch.description}</div>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {arch.roles.map(r => (
                                                <Badge key={r.id} variant="outline" className="text-xs">
                                                    {r.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div
                                    className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedArchetypeId === 'custom' ? 'border-primary bg-accent' : ''
                                        }`}
                                    onClick={() => setSelectedArchetypeId('custom')}
                                >
                                    <div className="font-medium">Custom Department</div>
                                    <div className="text-sm text-muted-foreground">Create without a template</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Department Name</Label>
                                <Input
                                    value={deptName}
                                    onChange={(e) => setDeptName(e.target.value)}
                                    placeholder="e.g. Sales Team A"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {createStep === 2 && (
                            <Button variant="outline" onClick={() => setCreateStep(1)}>Back</Button>
                        )}
                        {createStep === 1 ? (
                            <Button onClick={handleCreateNext} disabled={!selectedArchetypeId}>Next</Button>
                        ) : (
                            <Button onClick={handleCreateSave} disabled={saving || !deptName}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Department'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign User Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign User to {selectedDept?.name}</DialogTitle>
                        <DialogDescription>
                            Select a user and their role in this department.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>User</Label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users
                                        .filter(u => !u.deptId || u.deptId !== selectedDept?.id)
                                        .map(u => (
                                            <SelectItem key={u.id} value={u.id}>
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <span>{u.fullName}</span>
                                                    <span className="text-xs text-muted-foreground">({u.email})</span>
                                                    {u.roleArchetype ? (
                                                        <span className="text-green-600 text-xs font-medium">
                                                            {u.roleArchetype.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedDept?.archetype && (
                            <div className="space-y-2">
                                <Label>Role (Optional)</Label>
                                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedDept.archetype.roles?.map(role => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Selecting a role will automatically configure KPIs for this user.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignSave} disabled={saving || !selectedUserId}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
