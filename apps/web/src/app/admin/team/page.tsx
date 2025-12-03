'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Loader2, Search, Filter, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface RoleArchetype {
    id: string;
    code: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
    archetype?: {
        name: string;
        roles: RoleArchetype[];
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

function TeamPageContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState<string>(searchParams.get('filter') === 'unassigned' ? 'unassigned' : 'all');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Assignment Dialog
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [usersRes, deptsRes] = await Promise.all([
                api.get('/departments/users-available'),
                api.get('/departments')
            ]);

            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtered users
    const filteredUsers = users.filter(u => {
        // Search filter
        if (searchQuery && !u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !u.email.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Department filter
        if (deptFilter === 'unassigned' && u.deptId !== null) return false;
        if (deptFilter === 'assigned' && u.deptId === null) return false;
        if (deptFilter !== 'all' && deptFilter !== 'unassigned' && deptFilter !== 'assigned' && u.deptId !== deptFilter) return false;

        // Role filter
        if (roleFilter === 'unassigned' && u.roleArchetype) return false;
        if (roleFilter === 'assigned' && !u.roleArchetype) return false;
        if (roleFilter !== 'all' && roleFilter !== 'unassigned' && roleFilter !== 'assigned' && u.roleArchetype?.code !== roleFilter) return false;

        return true;
    });

    const handleAssignOpen = (user: User) => {
        setSelectedUser(user);
        setSelectedDeptId(user.deptId || '');
        setSelectedRoleId('');
        setAssignDialogOpen(true);
    };

    const handleAssignSave = async () => {
        if (!selectedUser || !selectedDeptId) return;

        setSaving(true);
        try {
            await api.post(`/departments/${selectedDeptId}/assign-user`, {
                userId: selectedUser.id,
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

    const selectedDepartment = departments.find(d => d.id === selectedDeptId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground">
                    Manage all employees across departments
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${deptFilter === 'all' && roleFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => { setDeptFilter('all'); setRoleFilter('all'); }}
                >
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Employees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${deptFilter === 'unassigned' ? 'ring-2 ring-amber-600' : ''}`}
                    onClick={() => { setDeptFilter('unassigned'); setRoleFilter('all'); }}
                >
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Missing Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {users.filter(u => !u.deptId).length}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${roleFilter === 'unassigned' ? 'ring-2 ring-destructive' : ''}`}
                    onClick={() => { setRoleFilter('unassigned'); setDeptFilter('all'); }}
                >
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Missing Role
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {users.filter(u => !u.roleArchetype).length}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${deptFilter === 'assigned' && roleFilter === 'assigned' ? 'ring-2 ring-green-600' : ''}`}
                    onClick={() => { setDeptFilter('assigned'); setRoleFilter('assigned'); }}
                >
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Fully Onboarded
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.deptId && u.roleArchetype).length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={deptFilter} onValueChange={setDeptFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Role Status</Label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="unassigned">No Role</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Showing {filteredUsers.length} of {users.length} employees
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No employees found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.fullName}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            {user.deptId ? (
                                                <Badge variant="secondary">
                                                    {departments.find(d => d.id === user.deptId)?.name || 'Unknown'}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-amber-600 font-medium">
                                                    Unassigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.roleArchetype ? (
                                                <Badge variant="outline">
                                                    {user.roleArchetype.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    No role
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAssignOpen(user)}
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                {user.deptId ? 'Change' : 'Assign'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Assignment Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign {selectedUser?.fullName}</DialogTitle>
                        <DialogDescription>
                            Select department and role for this employee
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                            {dept.archetype && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    ({dept.archetype.name})
                                                </span>
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedDepartment?.archetype && (
                            <div className="space-y-2">
                                <Label>Role (Optional)</Label>
                                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedDepartment.archetype.roles.map(role => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Selecting a role will automatically configure KPIs
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignSave} disabled={saving || !selectedDeptId}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function TeamPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <TeamPageContent />
        </Suspense>
    );
}
