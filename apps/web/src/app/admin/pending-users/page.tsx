'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PendingUser {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
}

export default function AdminPendingUsersPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        try {
            const { data } = await api.get('/users/pending');
            setPendingUsers(data);
        } catch (error) {
            console.error('Failed to fetch pending users', error);
            toast({
                title: 'Error',
                description: 'Failed to load pending users',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.post(`/users/${userId}/approve`);
            toast({
                title: 'User Approved',
                description: 'The user has been approved and can now access the system.',
            });
            // Remove from list
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to approve user', error);
            toast({
                title: 'Error',
                description: 'Failed to approve user',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Are you sure you want to reject this user? This will delete their account.')) {
            return;
        }

        setActionLoading(userId);
        try {
            await api.delete(`/users/${userId}/reject`);
            toast({
                title: 'User Rejected',
                description: 'The user has been rejected and removed from the system.',
            });
            // Remove from list
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to reject user', error);
            toast({
                title: 'Error',
                description: 'Failed to reject user',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(null);
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
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        <div>
                            <CardTitle>Pending Join Requests</CardTitle>
                            <CardDescription>
                                Review and approve users requesting to join your organization
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No pending requests</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingUsers.map((pendingUser) => (
                                    <TableRow key={pendingUser.id}>
                                        <TableCell className="font-medium">{pendingUser.fullName}</TableCell>
                                        <TableCell>{pendingUser.email}</TableCell>
                                        <TableCell>
                                            {new Date(pendingUser.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleApprove(pendingUser.id)}
                                                    disabled={actionLoading === pendingUser.id}
                                                >
                                                    {actionLoading === pendingUser.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReject(pendingUser.id)}
                                                    disabled={actionLoading === pendingUser.id}
                                                >
                                                    {actionLoading === pendingUser.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
