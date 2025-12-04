"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    CheckCircle,
    Circle,
    TrendingUp,
    TrendingDown,
    Target,
    FileText,
    AlertCircle,
    ChevronRight,
    Briefcase
} from "lucide-react";
import Link from "next/link";

interface KnowledgeDocument {
    id: string;
    title: string;
    type: string;
    level: string;
    status: string;
    effectiveAt: string | null;
    isAcknowledged?: boolean;
    _count?: {
        acknowledgments: number;
    };
}

interface JobRole {
    id: string;
    name: string;
    mission: string | null;
    responsibilities: string[] | null;
    archetype?: {
        id: string;
        code: string;
        kpis?: KPITemplate[];
    };
}

interface KPITemplate {
    id: string;
    code: string;
    name: string;
    description: string | null;
    unit: string;
    direction: 'HIGHER_BETTER' | 'LOWER_BETTER' | 'TARGET_VALUE';
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    // For demo - current values would come from daily reports
    currentValue?: number;
}

export default function MyKnowledgePage() {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [kpis, setKpis] = useState<KPITemplate[]>([]);
    const [jobRole, setJobRole] = useState<JobRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // Fetch documents relevant to user (PERSON level or their role)
            const docsRes = await fetch("/api/knowledge-documents?status=PUBLISHED");
            if (docsRes.ok) {
                const docs = await docsRes.json();
                setDocuments(docs);
            }

            // Fetch user's job role with archetype KPIs
            const userRes = await fetch("/api/user/me");
            if (userRes.ok) {
                const user = await userRes.json();
                if (user.jobRole) {
                    setJobRole(user.jobRole);

                    // Get KPIs from role archetype
                    if (user.jobRole.archetype?.code) {
                        const kpisRes = await fetch(`/api/role-archetypes/roles/${user.jobRole.archetype.code}/kpis`);
                        if (kpisRes.ok) {
                            const kpiData = await kpisRes.json();
                            // Add mock current values for demo
                            const withValues = kpiData.map((kpi: KPITemplate, i: number) => ({
                                ...kpi,
                                currentValue: [7, 85, 12, 95, 3][i % 5], // Mock values
                            }));
                            setKpis(withValues);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching knowledge data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function acknowledgeDocument(docId: string) {
        setAcknowledging(docId);
        try {
            const res = await fetch(`/api/knowledge-documents/${docId}/acknowledge`, {
                method: "POST",
            });
            if (res.ok) {
                setDocuments(docs =>
                    docs.map(d => d.id === docId ? { ...d, isAcknowledged: true } : d)
                );
            }
        } catch (error) {
            console.error("Error acknowledging document:", error);
        } finally {
            setAcknowledging(null);
        }
    }

    // Simple status based on having a value - real logic would compare to targets
    function getKPIStatus(kpi: KPITemplate): "green" | "yellow" | "red" {
        if (!kpi.currentValue) return "red";
        // For demo: high values = green, medium = yellow, low = red
        const val = kpi.currentValue;
        const isHigherBetter = kpi.direction === "HIGHER_BETTER";

        if (isHigherBetter) {
            if (val >= 80) return "green";
            if (val >= 50) return "yellow";
            return "red";
        } else {
            if (val <= 20) return "green";
            if (val <= 50) return "yellow";
            return "red";
        }
    }

    const unacknowledgedDocs = documents.filter(d => !d.isAcknowledged);
    const acknowledgedDocs = documents.filter(d => d.isAcknowledged);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Моя база знань
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Інструкції, KPI та документи для вашої ролі
                    </p>
                </div>
            </div>

            {/* My Role Card */}
            {jobRole && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 rounded-xl p-3">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{jobRole.name}</h2>
                            {jobRole.mission && (
                                <p className="mt-2 text-white/90">{jobRole.mission}</p>
                            )}
                            {jobRole.responsibilities && jobRole.responsibilities.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-white/70 mb-2">Ключові обов&apos;язки:</p>
                                    <ul className="space-y-1">
                                        {(jobRole.responsibilities as string[]).slice(0, 3).map((r, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-white/80" />
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Status */}
            {kpis.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-600" />
                            Мої KPI
                        </h2>
                        <Link
                            href="/settings/roles"
                            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                            Архетипи ролей <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {kpis.slice(0, 6).map((kpi) => {
                            const status = getKPIStatus(kpi);
                            const statusColors = {
                                green: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
                                yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
                                red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
                            };
                            const StatusIcon = status === "green"
                                ? TrendingUp
                                : status === "yellow"
                                    ? Target
                                    : TrendingDown;

                            return (
                                <div
                                    key={kpi.id}
                                    className={`rounded-xl border p-4 ${statusColors[status]}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-80">{kpi.name}</p>
                                            <p className="text-2xl font-bold mt-1">
                                                {kpi.currentValue ?? "—"} {kpi.unit}
                                            </p>
                                        </div>
                                        <StatusIcon className="w-5 h-5 opacity-60" />
                                    </div>
                                    {kpi.description && (
                                        <p className="text-xs mt-2 opacity-70">
                                            {kpi.description}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Required Reading */}
            {unacknowledgedDocs.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-6">
                    <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5" />
                        Обов&apos;язково до ознайомлення
                        <span className="ml-2 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full">
                            {unacknowledgedDocs.length}
                        </span>
                    </h2>
                    <div className="space-y-3">
                        {unacknowledgedDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-amber-600" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {doc.type.replace("_", " ")}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => acknowledgeDocument(doc.id)}
                                    disabled={acknowledging === doc.id}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors disabled:opacity-50"
                                >
                                    {acknowledging === doc.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Ознайомився
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Мої інструкції
                    </h2>
                    <Link
                        href="/settings/knowledge/documents"
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                        Усі документи <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Документів ще немає</p>
                        <p className="text-sm">Зверніться до керівника для створення інструкцій</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/settings/knowledge/documents/${doc.id}`}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {doc.isAcknowledged ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-300" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {doc.type.replace("_", " ")} • {doc.level}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
