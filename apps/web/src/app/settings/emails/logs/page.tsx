"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle2, AlertCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface EmailLog {
    id: string;
    templateId: string;
    recipient: string;
    status: string;
    error: string | null;
    sentAt: string;
    metadata: any;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    sent: {
        icon: CheckCircle2,
        color: "text-green-700 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30"
    },
    failed: {
        icon: AlertCircle,
        color: "text-red-700 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30"
    },
    queued: {
        icon: Clock,
        color: "text-yellow-700 dark:text-yellow-400",
        bg: "bg-yellow-100 dark:bg-yellow-900/30"
    },
};

export default function EmailLogsPage() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                });
                if (search) params.set("search", search);
                if (statusFilter) params.set("status", statusFilter);

                const response = await fetch(`/api/email-logs?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data.logs);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [pagination.page, search, statusFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("uk-UA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Logs</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        View history of sent emails and their delivery status
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by email or type..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                        <option value="queued">Queued</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Recipient
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Template
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Error
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={5} className="px-4 py-4">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No email logs found</p>
                                    <p className="text-sm mt-1">Logs will appear here when emails are sent</p>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => {
                                const status = statusConfig[log.status] || statusConfig.queued;
                                const Icon = status.icon;
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            {formatDate(log.sentAt)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                                            {log.recipient}
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                                                {log.templateId}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                                                <Icon className="w-3 h-3" />
                                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                            {log.error || "—"}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
