"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/lib/api";
import { Check, X, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Role {
    id: string;
    name: string;
    description: string;
    scopes: string[];
    isSystem: boolean;
}

// Critical permissions that require confirmation
const CRITICAL_PERMISSIONS = [
    'full.access',
    'roles.manage',
    'org.billing',
    'org.manage',
    'integrations.manage',
    'kpi.manage.all',
];

// All available permissions grouped by category
const PERMISSION_CATEGORIES = [
    {
        category: "Daily Reports",
        permissions: [
            { scope: "daily-report.read", label: "View own reports" },
            { scope: "daily-report.create", label: "Create reports" },
            { scope: "daily-report.read.team", label: "View team reports" },
            { scope: "daily-report.read.all", label: "View all reports" },
        ]
    },
    {
        category: "Team Management",
        permissions: [
            { scope: "team.read", label: "View team members" },
            { scope: "team.manage", label: "Manage team members" },
            { scope: "department.read", label: "View departments" },
            { scope: "department.manage", label: "Manage departments" },
        ]
    },
    {
        category: "Organization",
        permissions: [
            { scope: "org.read", label: "View organization" },
            { scope: "org.manage", label: "Manage organization" },
            { scope: "org.invite", label: "Invite users" },
            { scope: "org.billing", label: "Manage billing" },
        ]
    },
    {
        category: "Projects & Tags",
        permissions: [
            { scope: "project.read", label: "View projects" },
            { scope: "project.create", label: "Create projects" },
            { scope: "project.manage", label: "Manage all projects" },
            { scope: "tag.manage", label: "Manage tags" },
        ]
    },
    {
        category: "KPIs",
        permissions: [
            { scope: "kpi.read", label: "View own KPIs" },
            { scope: "kpi.manage", label: "Manage own KPIs" },
            { scope: "kpi.read.team", label: "View team KPIs" },
            { scope: "kpi.manage.all", label: "Manage all KPIs" },
        ]
    },
    {
        category: "Admin",
        permissions: [
            { scope: "roles.manage", label: "Manage roles" },
            { scope: "integrations.manage", label: "Manage integrations" },
            { scope: "access.view", label: "View access logs" },
            { scope: "full.access", label: "Full system access" },
        ]
    }
];

export function RolesTab() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Add Role Dialog
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDescription, setNewRoleDescription] = useState("");
    const [copyFromRole, setCopyFromRole] = useState<string>("none");

    // Edit Role Dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editRoleName, setEditRoleName] = useState("");
    const [editRoleDescription, setEditRoleDescription] = useState("");

    // Confirmation Dialog
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingPermissionChange, setPendingPermissionChange] = useState<{
        roleId: string;
        scope: string;
        currentValue: boolean;
    } | null>(null);

    // Delete Role Dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const { data } = await api.get("/user-admin/roles");
            setRoles(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (role: Role, scope: string) => {
        return role.scopes.includes(scope);
    };

    const togglePermission = async (roleId: string, scope: string, currentValue: boolean) => {
        const role = roles.find(r => r.id === roleId);
        if (!role || role.isSystem) {
            toast.error("Cannot modify system roles");
            return;
        }

        // Check if this is a critical permission
        if (CRITICAL_PERMISSIONS.includes(scope) && !currentValue) {
            // Trying to grant critical permission - show confirmation
            setPendingPermissionChange({ roleId, scope, currentValue });
            setConfirmDialogOpen(true);
            return;
        }

        await executePermissionChange(roleId, scope, currentValue);
    };

    const executePermissionChange = async (roleId: string, scope: string, currentValue: boolean) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        setSaving(true);
        try {
            const newScopes = currentValue
                ? role.scopes.filter(s => s !== scope)
                : [...role.scopes, scope];

            await api.patch(`/user-admin/roles/${roleId}`, { scopes: newScopes });

            setRoles(roles.map(r =>
                r.id === roleId ? { ...r, scopes: newScopes } : r
            ));

            toast.success("Permission updated");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update permission");
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmCriticalPermission = async () => {
        if (pendingPermissionChange) {
            await executePermissionChange(
                pendingPermissionChange.roleId,
                pendingPermissionChange.scope,
                pendingPermissionChange.currentValue
            );
        }
        setConfirmDialogOpen(false);
        setPendingPermissionChange(null);
    };

    const handleAddRole = async () => {
        if (!newRoleName.trim()) {
            toast.error("Role name is required");
            return;
        }

        setSaving(true);
        try {
            const baseScopes = copyFromRole && copyFromRole !== "none"
                ? roles.find(r => r.id === copyFromRole)?.scopes || []
                : [];

            const { data } = await api.post("/user-admin/roles", {
                name: newRoleName,
                description: newRoleDescription,
                scopes: baseScopes,
                isSystem: false
            });

            setRoles([...roles, data]);
            toast.success(`Role "${newRoleName}" created`);

            // Reset form
            setNewRoleName("");
            setNewRoleDescription("");
            setCopyFromRole("none");
            setAddDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create role");
        } finally {
            setSaving(false);
        }
    };

    const handleEditRole = async () => {
        if (!editingRole || !editRoleName.trim()) {
            toast.error("Role name is required");
            return;
        }

        setSaving(true);
        try {
            await api.patch(`/user-admin/roles/${editingRole.id}`, {
                name: editRoleName,
                description: editRoleDescription
            });

            setRoles(roles.map(r =>
                r.id === editingRole.id
                    ? { ...r, name: editRoleName, description: editRoleDescription }
                    : r
            ));

            toast.success("Role updated");
            setEditDialogOpen(false);
            setEditingRole(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update role");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!deletingRole) return;

        setSaving(true);
        try {
            await api.delete(`/user-admin/roles/${deletingRole.id}`);
            setRoles(roles.filter(r => r.id !== deletingRole.id));
            toast.success(`Role "${deletingRole.name}" deleted`);
            setDeleteDialogOpen(false);
            setDeletingRole(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete role");
        } finally {
            setSaving(false);
        }
    };

    const openEditDialog = (role: Role) => {
        setEditingRole(role);
        setEditRoleName(role.name);
        setEditRoleDescription(role.description);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (role: Role) => {
        setDeletingRole(role);
        setDeleteDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Roles & Permissions</CardTitle>
                            <CardDescription>
                                Manage access rights for different roles in your organization
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Role
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {roles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No roles defined.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                {/* Header with role names */}
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 border-b font-medium text-sm text-muted-foreground sticky left-0 bg-background z-10">
                                            Permissions
                                        </th>
                                        {roles.map(role => (
                                            <th
                                                key={role.id}
                                                className="p-4 border-b text-center min-w-[140px]"
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{role.name}</span>
                                                        {!role.isSystem && (
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => openEditDialog(role)}
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                                    onClick={() => openDeleteDialog(role)}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {role.isSystem && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            System
                                                        </Badge>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                {/* Body with permissions */}
                                <tbody>
                                    {PERMISSION_CATEGORIES.map((category, catIndex) => (
                                        <>
                                            {/* Category header */}
                                            <tr key={`cat-${catIndex}`}>
                                                <td
                                                    colSpan={roles.length + 1}
                                                    className="p-3 bg-muted/50 border-b font-medium text-sm sticky left-0 z-10"
                                                >
                                                    {category.category}
                                                </td>
                                            </tr>

                                            {/* Permission rows */}
                                            {category.permissions.map((perm, permIndex) => (
                                                <tr
                                                    key={`${catIndex}-${permIndex}`}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="p-4 border-b text-sm sticky left-0 bg-background">
                                                        <div className="flex items-center gap-2">
                                                            {perm.label}
                                                            {CRITICAL_PERMISSIONS.includes(perm.scope) && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Critical
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {roles.map(role => {
                                                        const hasAccess = hasPermission(role, perm.scope);
                                                        const isEditable = !role.isSystem;

                                                        return (
                                                            <td
                                                                key={role.id}
                                                                className="p-4 border-b text-center"
                                                            >
                                                                {isEditable ? (
                                                                    <Checkbox
                                                                        checked={hasAccess}
                                                                        onCheckedChange={() =>
                                                                            togglePermission(role.id, perm.scope, hasAccess)
                                                                        }
                                                                        disabled={saving}
                                                                        className="mx-auto"
                                                                    />
                                                                ) : (
                                                                    hasAccess ? (
                                                                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                                                                    ) : (
                                                                        <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                                                                    )
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Allowed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <X className="w-4 h-4 text-muted-foreground/30" />
                            <span>Not allowed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox checked={false} disabled className="pointer-events-none" />
                            <span>Editable (click to toggle)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">System</Badge>
                            <span>Cannot be modified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                            <span>Requires confirmation</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Role Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>
                            Create a custom role with specific permissions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Role Name *</Label>
                            <Input
                                id="role-name"
                                placeholder="e.g., Project Manager"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role-description">Description</Label>
                            <Textarea
                                id="role-description"
                                placeholder="Describe this role's responsibilities..."
                                value={newRoleDescription}
                                onChange={(e) => setNewRoleDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="copy-from">Copy permissions from</Label>
                            <Select value={copyFromRole} onValueChange={setCopyFromRole}>
                                <SelectTrigger id="copy-from">
                                    <SelectValue placeholder="Start from scratch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Start from scratch</SelectItem>
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name} ({role.scopes.length} permissions)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                You can customize permissions after creating the role
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddRole} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Update role name and description
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-role-name">Role Name *</Label>
                            <Input
                                id="edit-role-name"
                                value={editRoleName}
                                onChange={(e) => setEditRoleName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-role-description">Description</Label>
                            <Textarea
                                id="edit-role-description"
                                value={editRoleDescription}
                                onChange={(e) => setEditRoleDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditRole} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Critical Permission Confirmation */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Critical Permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to grant a critical permission that gives significant access to the system.
                            <br /><br />
                            <strong>Permission:</strong> {pendingPermissionChange?.scope}
                            <br /><br />
                            Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmCriticalPermission}>
                            Yes, Grant Permission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Role Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the role <strong>"{deletingRole?.name}"</strong>?
                            <br /><br />
                            This action cannot be undone. Users with this role will lose their permissions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteRole}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
