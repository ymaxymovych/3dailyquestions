"use client";

import { useState, useEffect } from "react";
import {
    Send,
    CheckCircle2,
    Users,
    Clock,
    TrendingUp,
    TrendingDown
} from "lucide-react";

interface Stats {
    totalSent: number;
    totalFailed: number;
    totalQueued: number;
    deliveryRate: string;
    totalSubscribers: number;
    pendingSubscribers: number;
}

export default function EmailDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/email-logs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "stats" }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total Sent (30d)",
            value: stats?.totalSent?.toLocaleString() ?? "0",
            change: "+12%",
            positive: true,
            icon: Send,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
            label: "Delivery Rate",
            value: `${stats?.deliveryRate ?? "100.0"}%`,
            change: "+0.1%",
            positive: true,
            icon: CheckCircle2,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/20",
        },
        {
            label: "Subscribers",
            value: stats?.totalSubscribers?.toLocaleString() ?? "0",
            change: "+24%",
            positive: true,
            icon: Users,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
        },
        {
            label: "Pending Confirmations",
            value: stats?.pendingSubscribers?.toLocaleString() ?? "0",
            change: "-5%",
            positive: false,
            icon: Clock,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-900/20",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Dashboard Overview
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Monitor your email performance and subscriber engagement
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </p>
                                    <p className={`mt-2 text-2xl font-bold text-slate-900 dark:text-white ${loading ? 'animate-pulse' : ''}`}>
                                        {loading ? "..." : stat.value}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
                                {stat.positive ? (
                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-red-500" />
                                )}
                                <span className={stat.positive ? "text-green-600" : "text-red-600"}>
                                    {stat.change}
                                </span>
                                <span className="text-slate-400">vs last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Email Performance (Last 7 Days)
                    </h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-center">
                            <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Chart will appear when email sending is active</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Delivery Status Distribution
                    </h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Status breakdown will appear here</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">🚀 Ready to send emails?</h3>
                <p className="text-blue-100 mb-4">
                    Configure your email provider (Resend) and DNS records to start sending transactional emails.
                </p>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                        Configure Provider
                    </button>
                    <button className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                        View Documentation
                    </button>
                </div>
            </div>
        </div>
    );
}
