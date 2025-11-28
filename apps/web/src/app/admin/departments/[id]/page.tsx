'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Briefcase, UserMinus, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface RoleArchetype {
    id: string;
    code: string;
    name: string;
    level: string;
}

interface DepartmentArchetype {
    id: string;
    code: string;
    name: string;
    description: string;
    roles: RoleArchetype[];
}

interface User {
    id: string;
    email: string;
    fullName: string;
    roleArchetype?: RoleArchetype;
}

interface Project {
    id: string;
    name: string;
    status: string;
}

interface Department {
    id: string;
    name: string;
    archetypeId: string | null;
    archetype?: DepartmentArchetype;
    managerId: string | null;
    hrId: string | null;
    users: User[];
    projects: Project[];
    _count: {
        users: number;
        projects: number;
    };
}

export default function DepartmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [department, setDepartment] = useState<Department | null>(null);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    const fetchDepartment = async () => {
        try {
            const res = await api.get(`/departments/${params.id}`);
            console.log('Department detail:', res.data);
            setDepartment(res.data);
        } catch (error: any) {
            console.error('Failed to fetch department', error);
            toast.error('Failed to load department');
            router.push('/admin/departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchDepartment();
        }
    }, [params.id]);

    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Remove this user from the department?')) return;

        setRemoving(userId);
        try {
            await api.delete(`/departments/${params.id}/users/${userId}`);

            toast.success('User removed from department');
            fetchDepartment();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove user');
        } finally {
            setRemoving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!department) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-6">
                <Link href="/admin/departments">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Departments
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{department.name}</h1>
                        {department.archetype && (
                            <p className="text-muted-foreground mt-1">
                                {department.archetype.description}
                            </p>
                        )}
                    </div>
                    <Badge variant={department.archetype ? "secondary" : "outline"}>
                        {department.archetype ? department.archetype.name : "Custom"}
                    </Badge>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Employees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="text-2xl font-bold">{department._count.users}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                            <span className="text-2xl font-bold">{department._count.projects}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available Roles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-1">
                            {department.archetype?.roles.map(role => (
                                <Badge key={role.id} variant="outline" className="text-xs">
                                    {role.name}
                                </Badge>
                            )) || (
                                    <span className="text-sm text-muted-foreground">No template</span>
                                )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Employees List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Employees</CardTitle>
                            <CardDescription>
                                Team members in this department
                            </CardDescription>
                        </div>
                        <Link href={`/admin/departments?assign=${department.id}`}>
                            <Button size="sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Employee
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {department.users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No employees assigned yet. Click "Add Employee" to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                department.users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.fullName}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            {user.roleArchetype ? (
                                                <Badge variant="secondary">
                                                    {user.roleArchetype.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">
                                                    Unassigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleRemoveUser(user.id)}
                                                disabled={removing === user.id}
                                            >
                                                {removing === user.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <UserMinus className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Projects List (if any) */}
            {department.projects.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                            Projects assigned to this department
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {department.projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">
                                            {project.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
