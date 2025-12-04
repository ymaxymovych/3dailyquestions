"use client";

import { useState } from "react";
import { Users, Download, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";

// Mock data for now - will be replaced with API calls
const MOCK_SUBSCRIBERS = [
    { id: "1", email: "john@example.com", status: "confirmed", source: "Landing Page", language: "uk", createdAt: "2024-01-15" },
    { id: "2", email: "jane@company.com", status: "confirmed", source: "Onboarding", language: "en", createdAt: "2024-02-20" },
    { id: "3", email: "bob@test.com", status: "pending", source: "Newsletter Form", language: "uk", createdAt: "2024-03-01" },
    { id: "4", email: "alice@demo.com", status: "unsubscribed", source: "Landing Page", language: "en", createdAt: "2024-03-10" },
];

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    confirmed: {
        icon: CheckCircle2,
        color: "text-green-700 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        label: "Confirmed"
    },
    pending: {
        icon: Clock,
        color: "text-yellow-700 dark:text-yellow-400",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        label: "Pending"
    },
    unsubscribed: {
        icon: XCircle,
        color: "text-slate-500 dark:text-slate-400",
        bg: "bg-slate-100 dark:bg-slate-700",
        label: "Unsubscribed"
    },
};

export default function SubscribersPage() {
    const [subscribers] = useState(MOCK_SUBSCRIBERS);
    const [statusFilter, setStatusFilter] = useState("");

    const filteredSubscribers = statusFilter
        ? subscribers.filter(s => s.status === statusFilter)
        : subscribers;

    const stats = {
        total: subscribers.length,
        confirmed: subscribers.filter(s => s.status === "confirmed").length,
        pending: subscribers.filter(s => s.status === "pending").length,
        unsubscribed: subscribers.filter(s => s.status === "unsubscribed").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subscribers</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage newsletter and marketing email subscribers
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Subscriber
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: stats.total, color: "text-slate-900 dark:text-white" },
                    { label: "Confirmed", value: stats.confirmed, color: "text-green-600 dark:text-green-400" },
                    { label: "Pending", value: stats.pending, color: "text-yellow-600 dark:text-yellow-400" },
                    { label: "Unsubscribed", value: stats.unsubscribed, color: "text-slate-500 dark:text-slate-400" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {["", "confirmed", "pending", "unsubscribed"].map((status) => (
                    <button
                        key={status || "all"}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${statusFilter === status
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                    >
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Source
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Language
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Joined
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredSubscribers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No subscribers found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredSubscribers.map((sub) => {
                                const status = statusConfig[sub.status];
                                const Icon = status.icon;
                                return (
                                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                                            {sub.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                                                <Icon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {sub.source}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {sub.language === "uk" ? "🇺🇦 UA" : "🇺🇸 EN"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(sub.createdAt).toLocaleDateString("uk-UA")}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Subscriber Management</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Subscribers are collected from your landing page newsletter form. When you configure email sending (Resend),
                            you'll be able to send marketing emails to confirmed subscribers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
