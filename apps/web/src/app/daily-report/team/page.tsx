'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, AlertCircle, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';

interface TeamReport {
    id: string;
    userId: string;
    date: string;
    todayBig: any;
    todayMedium: any;
    todaySmall: any;
    yesterdayBig: any;
    loadStatus: 'BALANCED' | 'OVERLOADED' | 'UNDERLOADED';
    loadManuallySet: boolean;
    visibility: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        roleArchetype?: {
            name: string;
            code: string;
        };
    };
    helpRequests: any[];
    kpis: any[];
    reactions: Array<{
        id: string;
        emoji: string;
        userId: string;
        user: {
            id: string;
            fullName: string;
        };
    }>;
    comments: Array<{
        id: string;
        text: string;
        userId: string;
        createdAt: string;
        user: {
            id: string;
            fullName: string;
        };
    }>;
}

export default function TeamDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<TeamReport[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // UI State
    const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Comment dialog
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedReportForComment, setSelectedReportForComment] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');

    // Manager dialogs
    const [bigTaskDialogOpen, setBigTaskDialogOpen] = useState(false);
    const [loadStatusDialogOpen, setLoadStatusDialogOpen] = useState(false);
    const [selectedReportForManager, setSelectedReportForManager] = useState<TeamReport | null>(null);
    const [newBigTask, setNewBigTask] = useState('');
    const [managerComment, setManagerComment] = useState('');
    const [newLoadStatus, setNewLoadStatus] = useState<'BALANCED' | 'OVERLOADED' | 'UNDERLOADED'>('BALANCED');

    const toggleExpand = (reportId: string) => {
        setExpandedReports(prev => ({
            ...prev,
            [reportId]: !prev[reportId]
        }));
    };

    const fetchTeamReports = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/daily-reports/team/feed?date=${selectedDate}`);
            setReports(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load team reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamReports();
    }, [selectedDate]);

    const handleReaction = async (reportId: string, emoji: string) => {
        try {
            await api.post(`/daily-reports/${reportId}/reaction`, { emoji });
            await fetchTeamReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add reaction');
        }
    };

    const handleAddComment = async () => {
        if (!selectedReportForComment || !commentText.trim()) return;

        try {
            await api.post(`/daily-reports/${selectedReportForComment}/comment`, { text: commentText });
            toast.success('Comment added');
            setCommentText('');
            setCommentDialogOpen(false);
            await fetchTeamReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add comment');
        }
    };

    const handleUpdateBigTask = async () => {
        if (!selectedReportForManager || !newBigTask.trim() || !managerComment.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await api.patch(`/daily-reports/${selectedReportForManager.id}/manager/big-task`, {
                newBigTask: { text: newBigTask },
                comment: managerComment,
            });
            toast.success('Big Task updated');
            setBigTaskDialogOpen(false);
            setNewBigTask('');
            setManagerComment('');
            await fetchTeamReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update Big Task');
        }
    };

    const handleSetLoadStatus = async () => {
        if (!selectedReportForManager) return;

        try {
            await api.patch(`/daily-reports/${selectedReportForManager.id}/manager/load-status`, {
                loadStatus: newLoadStatus,
            });
            toast.success('Load status updated');
            setLoadStatusDialogOpen(false);
            await fetchTeamReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update load status');
        }
    };

    const filteredReports = reports.filter((report) => {
        if (statusFilter === 'blocked') return report.helpRequests?.length > 0;
        if (statusFilter === 'overloaded') return report.loadStatus === 'OVERLOADED';
        if (statusFilter === 'no-big') return !report.todayBig;
        return true;
    });

    const stats = {
        total: reports.length,
        blocked: reports.filter(r => r.helpRequests?.length > 0).length,
        overloaded: reports.filter(r => r.loadStatus === 'OVERLOADED').length,
        noBig: reports.filter(r => !r.todayBig).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Team Pulse</h1>
                        <p className="text-muted-foreground">Live updates on team focus, workload, and blockers</p>
                    </div>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const prev = new Date(selectedDate);
                            prev.setDate(prev.getDate() - 1);
                            setSelectedDate(prev.toISOString().split('T')[0]);
                        }}
                    >
                        ← Yesterday
                    </Button>
                    <div className="text-lg font-medium">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const next = new Date(selectedDate);
                            next.setDate(next.getDate() + 1);
                            setSelectedDate(next.toISOString().split('T')[0]);
                        }}
                    >
                        Tomorrow →
                    </Button>
                    <Button
                        onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    >
                        Today
                    </Button>
                </div>

                {/* Risk Panel (Stats) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            statusFilter === 'all' && 'ring-2 ring-primary'
                        )}
                        onClick={() => setStatusFilter('all')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Team Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            statusFilter === 'blocked' && 'ring-2 ring-amber-600'
                        )}
                        onClick={() => setStatusFilter('blocked')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                🔴 Blocked
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.blocked}</div>
                        </CardContent>
                    </Card>

                    <Card
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            statusFilter === 'overloaded' && 'ring-2 ring-red-600'
                        )}
                        onClick={() => setStatusFilter('overloaded')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                🔴 Overloaded
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overloaded}</div>
                        </CardContent>
                    </Card>

                    <Card
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            statusFilter === 'no-big' && 'ring-2 ring-gray-600'
                        )}
                        onClick={() => setStatusFilter('no-big')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                ⚪ No Big Task
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats.noBig}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Feed */}
                <div className="space-y-4">
                    {filteredReports.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No reports match your filters
                            </CardContent>
                        </Card>
                    ) : (
                        filteredReports.map((report) => (
                            <Card key={report.id} className="relative transition-all hover:shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-lg">{report.user.fullName}</CardTitle>
                                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                                    {report.user.roleArchetype?.name || 'Team Member'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {report.loadStatus === 'OVERLOADED' && (
                                                <div title={report.loadManuallySet ? "Manager marked as Overloaded" : "Auto-calculated: Too many tasks planned"}>
                                                    <Badge variant="destructive" className="cursor-help">
                                                        🔴 Overloaded {report.loadManuallySet && '(Manual)'}
                                                    </Badge>
                                                </div>
                                            )}
                                            {report.loadStatus === 'BALANCED' && (
                                                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20">
                                                    🟢 Balanced
                                                </Badge>
                                            )}
                                            {report.loadStatus === 'UNDERLOADED' && (
                                                <div title="User has capacity for more work">
                                                    <Badge variant="outline" className="text-gray-500 cursor-help">
                                                        ⚪ Underloaded
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Big Task */}
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Big Task</div>
                                        {report.todayBig ? (
                                            <div className="font-medium text-base p-3 bg-primary/5 rounded-md border border-primary/10">
                                                ◼ {typeof report.todayBig === 'string' ? report.todayBig : report.todayBig?.text || 'N/A'}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic">No Big Task selected</div>
                                        )}
                                    </div>

                                    {/* Medium Tasks */}
                                    {report.todayMedium && (Array.isArray(report.todayMedium) ? report.todayMedium.length > 0 : report.todayMedium) && (
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Medium Tasks</div>
                                            <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                                {Array.isArray(report.todayMedium)
                                                    ? report.todayMedium.map((task: any, idx: number) => (
                                                        <li key={idx}>{typeof task === 'string' ? task : task.text}</li>
                                                    ))
                                                    : <li>{typeof report.todayMedium === 'string' ? report.todayMedium : report.todayMedium.text}</li>
                                                }
                                            </ul>
                                        </div>
                                    )}

                                    {/* Expandable Details */}
                                    {expandedReports[report.id] && (
                                        <div className="pt-2 space-y-4 border-t">
                                            {/* Small Tasks */}
                                            {report.todaySmall && (
                                                <div>
                                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Small Tasks</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {Array.isArray(report.todaySmall)
                                                            ? report.todaySmall.map((t: any) => typeof t === 'string' ? t : t.text).join(', ')
                                                            : (typeof report.todaySmall === 'string' ? report.todaySmall : report.todaySmall.text)
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            {/* KPIs */}
                                            {report.kpis?.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">KPIs</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {report.kpis.map((kpi: any, idx: number) => (
                                                            <div key={idx} className="text-sm border p-2 rounded bg-muted/50">
                                                                <span className="font-medium">{kpi.name}:</span> {kpi.value} {kpi.unit}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Yesterday Context */}
                                            {report.yesterdayBig && (
                                                <div className="pt-2 border-t">
                                                    <div className="text-xs font-medium text-muted-foreground mb-1">Yesterday's Win</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {typeof report.yesterdayBig === 'string' ? report.yesterdayBig : report.yesterdayBig?.text || 'N/A'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Blockers */}
                                    {report.helpRequests?.length > 0 && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800/50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200 mb-1">
                                                <AlertCircle className="w-4 h-4" />
                                                Blockers / Needs Help
                                            </div>
                                            {report.helpRequests.map((hr: any) => (
                                                <div key={hr.id} className="text-sm text-amber-900 dark:text-amber-100 pl-6">
                                                    • {hr.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comments Preview */}
                                    {report.comments?.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t">
                                            {report.comments.slice(-2).map((comment) => (
                                                <div key={comment.id} className="text-sm bg-muted/50 p-2 rounded flex gap-2">
                                                    <span className="font-semibold text-primary">{comment.user.fullName}:</span>
                                                    <span className="text-foreground/90">{comment.text}</span>
                                                </div>
                                            ))}
                                            {report.comments.length > 2 && (
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => toggleExpand(report.id)}>
                                                    View all {report.comments.length} comments
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions Bar */}
                                    <div className="flex items-center gap-2 pt-3 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpand(report.id)}
                                            className="text-muted-foreground hover:text-foreground h-8"
                                        >
                                            {expandedReports[report.id] ? (
                                                <><ChevronUp className="w-4 h-4 mr-1" /> Show Less</>
                                            ) : (
                                                <><ChevronDown className="w-4 h-4 mr-1" /> Show More</>
                                            )}
                                        </Button>

                                        <div className="h-4 w-px bg-border mx-1" />

                                        {/* Reactions */}
                                        <div className="flex gap-1">
                                            {['👍', '👏', '🤝'].map(emoji => (
                                                <Button
                                                    key={emoji}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReaction(report.id, emoji)}
                                                    className={cn(
                                                        "px-2 h-8",
                                                        report.reactions?.some(r => r.emoji === emoji && r.userId === user?.id)
                                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    )}
                                                >
                                                    {emoji} <span className="ml-1 text-xs">{report.reactions?.filter((r: any) => r.emoji === emoji).length || 0}</span>
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedReportForComment(report.id);
                                                setCommentDialogOpen(true);
                                            }}
                                            className="text-muted-foreground hover:text-foreground h-8"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            Comment
                                        </Button>

                                        {/* Manager Actions */}
                                        <div className="ml-auto flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-8"
                                                title="Edit this user's Big Task if it's not aligned with team goals"
                                                onClick={() => {
                                                    setSelectedReportForManager(report);
                                                    setNewBigTask(typeof report.todayBig === 'string' ? report.todayBig : report.todayBig?.text || '');
                                                    setBigTaskDialogOpen(true);
                                                }}
                                            >
                                                Edit Task
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-8"
                                                title="Override auto-calculated load status (e.g., mark as Overloaded if you see they're struggling)"
                                                onClick={() => {
                                                    setSelectedReportForManager(report);
                                                    setNewLoadStatus(report.loadStatus);
                                                    setLoadStatusDialogOpen(true);
                                                }}
                                            >
                                                Set Load
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Comment Dialog */}
                <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Comment</DialogTitle>
                            <DialogDescription>
                                Share your thoughts or offer help
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="Write your comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={3}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                                Post Comment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Manager: Edit Big Task Dialog */}
                <Dialog open={bigTaskDialogOpen} onOpenChange={setBigTaskDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Big Task for {selectedReportForManager?.user.fullName}</DialogTitle>
                            <DialogDescription>
                                Change the employee's Big Task for today
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">New Big Task</label>
                                <Input
                                    placeholder="Enter new Big Task..."
                                    value={newBigTask}
                                    onChange={(e) => setNewBigTask(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Comment (required)</label>
                                <Textarea
                                    placeholder="Explain why you're changing this..."
                                    value={managerComment}
                                    onChange={(e) => setManagerComment(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBigTaskDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateBigTask} disabled={!newBigTask.trim() || !managerComment.trim()}>
                                Update
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Manager: Set Load Status Dialog */}
                <Dialog open={loadStatusDialogOpen} onOpenChange={setLoadStatusDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Set Load Status for {selectedReportForManager?.user.fullName}</DialogTitle>
                            <DialogDescription>
                                Override the auto-calculated workload status
                            </DialogDescription>
                        </DialogHeader>
                        <Select value={newLoadStatus} onValueChange={(val: any) => setNewLoadStatus(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BALANCED">🟢 Balanced</SelectItem>
                                <SelectItem value="OVERLOADED">🔴 Overloaded</SelectItem>
                                <SelectItem value="UNDERLOADED">⚪ Underloaded</SelectItem>
                            </SelectContent>
                        </Select>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setLoadStatusDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSetLoadStatus}>
                                Update Status
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
