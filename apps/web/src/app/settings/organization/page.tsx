'use client';

import { useState, useEffect } from 'react';
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
import { Building2, Users, Plus, Pencil, Trash2, UserCircle } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    description: string | null;
    managerId: string | null;
    manager: { id: string; fullName: string; email: string } | null;
    teams: { id: string; name: string; description: string | null }[];
    _count: { users: number };
}

interface Team {
    id: string;
    name: string;
    description: string | null;
    deptId: string;
    managerId: string | null;
    department: { id: string; name: string };
    manager: { id: string; fullName: string; email: string } | null;
    _count: { users: number };
}

export default function OrganizationPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    // Dialog states
    const [deptDialogOpen, setDeptDialogOpen] = useState(false);
    const [teamDialogOpen, setTeamDialogOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    // Form states
    const [deptName, setDeptName] = useState('');
    const [deptDescription, setDeptDescription] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [teamDeptId, setTeamDeptId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [deptsRes, teamsRes] = await Promise.all([
                fetch('/api/departments'),
                fetch('/api/teams'),
            ]);

            if (deptsRes.ok) setDepartments(await deptsRes.json());
            if (teamsRes.ok) setTeams(await teamsRes.json());
        } catch (error) {
            console.error('Failed to fetch organization data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openDeptDialog = (dept?: Department) => {
        if (dept) {
            setEditingDept(dept);
            setDeptName(dept.name);
            setDeptDescription(dept.description || '');
        } else {
            setEditingDept(null);
            setDeptName('');
            setDeptDescription('');
        }
        setDeptDialogOpen(true);
    };

    const openTeamDialog = (team?: Team) => {
        if (team) {
            setEditingTeam(team);
            setTeamName(team.name);
            setTeamDescription(team.description || '');
            setTeamDeptId(team.deptId);
        } else {
            setEditingTeam(null);
            setTeamName('');
            setTeamDescription('');
            setTeamDeptId(departments[0]?.id || '');
        }
        setTeamDialogOpen(true);
    };

    const handleSaveDept = async () => {
        try {
            const url = editingDept
                ? `/api/departments/${editingDept.id}`
                : '/api/departments';
            const method = editingDept ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: deptName,
                    description: deptDescription || null,
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Department ${editingDept ? 'updated' : 'created'} successfully`,
                });
                setDeptDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to save department:', error);
            toast({
                title: 'Error',
                description: 'Failed to save department',
                variant: 'destructive',
            });
        }
    };

    const handleSaveTeam = async () => {
        try {
            const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams';
            const method = editingTeam ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName,
                    description: teamDescription || null,
                    deptId: teamDeptId,
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Team ${editingTeam ? 'updated' : 'created'} successfully`,
                });
                setTeamDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to save team:', error);
            toast({
                title: 'Error',
                description: 'Failed to save team',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteDept = async (id: string) => {
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            const response = await fetch(`/api/departments/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Department deleted successfully' });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to delete department:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete department',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteTeam = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team?')) return;

        try {
            const response = await fetch(`/api/teams/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Team deleted successfully' });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to delete team:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete team',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">Loading organization structure...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Organization Structure</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your departments and teams
                </p>
            </div>

            {/* Departments */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Departments
                            </CardTitle>
                            <CardDescription>
                                Top-level organizational units
                            </CardDescription>
                        </div>
                        <Button onClick={() => openDeptDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {departments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No departments yet. Create your first department to get started.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {departments.map((dept) => (
                                <div
                                    key={dept.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">{dept.name}</h3>
                                            <Badge variant="secondary">
                                                {dept._count.users} {dept._count.users === 1 ? 'person' : 'people'}
                                            </Badge>
                                            <Badge variant="outline">
                                                {dept.teams.length} {dept.teams.length === 1 ? 'team' : 'teams'}
                                            </Badge>
                                        </div>
                                        {dept.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {dept.description}
                                            </p>
                                        )}
                                        {dept.manager && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <UserCircle className="h-4 w-4" />
                                                <span>Manager: {dept.manager.fullName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDeptDialog(dept)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteDept(dept.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Teams */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Teams
                            </CardTitle>
                            <CardDescription>
                                Smaller groups within departments
                            </CardDescription>
                        </div>
                        <Button onClick={() => openTeamDialog()} disabled={departments.length === 0}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Team
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {teams.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No teams yet. {departments.length > 0 ? 'Create your first team.' : 'Create a department first.'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">{team.name}</h3>
                                            <Badge variant="secondary">
                                                {team._count.users} {team._count.users === 1 ? 'member' : 'members'}
                                            </Badge>
                                            <Badge variant="outline">{team.department.name}</Badge>
                                        </div>
                                        {team.description && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {team.description}
                                            </p>
                                        )}
                                        {team.manager && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <UserCircle className="h-4 w-4" />
                                                <span>Manager: {team.manager.fullName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openTeamDialog(team)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteTeam(team.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Department Dialog */}
            <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingDept ? 'Edit Department' : 'Add Department'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDept
                                ? 'Update department information'
                                : 'Create a new department in your organization'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="deptName">Department Name *</Label>
                            <Input
                                id="deptName"
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="e.g., Engineering, Sales"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deptDescription">Description</Label>
                            <Textarea
                                id="deptDescription"
                                value={deptDescription}
                                onChange={(e) => setDeptDescription(e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveDept} disabled={!deptName}>
                            {editingDept ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Team Dialog */}
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTeam ? 'Edit Team' : 'Add Team'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTeam
                                ? 'Update team information'
                                : 'Create a new team within a department'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="teamName">Team Name *</Label>
                            <Input
                                id="teamName"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g., Frontend Team, Enterprise Sales"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="teamDept">Department *</Label>
                            <Select value={teamDeptId} onValueChange={setTeamDeptId}>
                                <SelectTrigger id="teamDept">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="teamDescription">Description</Label>
                            <Textarea
                                id="teamDescription"
                                value={teamDescription}
                                onChange={(e) => setTeamDescription(e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveTeam} disabled={!teamName || !teamDeptId}>
                            {editingTeam ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
