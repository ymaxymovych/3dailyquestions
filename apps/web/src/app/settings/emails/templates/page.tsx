"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Edit2,
    Search,
    Users,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

interface EmailTemplate {
    id: string;
    code: string;
    name: string;
    description: string;
    category: string;
    critical: boolean;
    enabled: boolean;
    recipients: string[];
    triggers: string;
}

const CATEGORIES = ["ALL", "ACCESS", "ONBOARDING", "LEGAL", "MARKETING"];

const categoryColors: Record<string, string> = {
    ACCESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ONBOARDING: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    LEGAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    MARKETING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const response = await fetch("/api/email-templates");
                if (response.ok) {
                    const data = await response.json();
                    setTemplates(data);
                }
            } catch (error) {
                console.error("Failed to fetch templates:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    const toggleEnabled = async (template: EmailTemplate) => {
        if (template.critical) return;

        try {
            const response = await fetch(`/api/email-templates/${template.code}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !template.enabled }),
            });

            if (response.ok) {
                setTemplates(prev =>
                    prev.map(t =>
                        t.id === template.id ? { ...t, enabled: !t.enabled } : t
                    )
                );
            }
        } catch (error) {
            console.error("Failed to toggle template:", error);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = filter === "ALL" || t.category === filter;
        const matchesSearch =
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.code.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Email Templates
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your transactional and marketing email templates
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === cat
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                    >
                        {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {template.name}
                                        </h3>
                                        <code className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                                            {template.code}
                                        </code>
                                        {template.critical && (
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Critical
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                        {template.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${categoryColors[template.category] || "bg-slate-100 text-slate-700"}`}>
                                            {template.category}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {template.recipients?.join(", ")}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${template.enabled ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                                            {template.enabled ? "Enabled" : "Disabled"}
                                        </span>
                                        <button
                                            onClick={() => toggleEnabled(template)}
                                            disabled={template.critical}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${template.enabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                                                } ${template.critical ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${template.enabled ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    <Link
                                        href={`/settings/emails/templates/${template.code}`}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredTemplates.length === 0 && (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No templates found matching your criteria</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
