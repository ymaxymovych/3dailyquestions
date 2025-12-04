"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FileText,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Building2,
    Users,
    User,
    Briefcase,
    Archive,
    CheckCircle,
    Clock,
    Edit3
} from "lucide-react";

interface KnowledgeDocument {
    id: string;
    title: string;
    type: string;
    level: string;
    status: string;
    effectiveAt: string | null;
    createdAt: string;
    dept?: { id: string; name: string } | null;
    team?: { id: string; name: string } | null;
    jobRole?: { id: string; name: string } | null;
    _count?: {
        acknowledgments: number;
        comments: number;
        children: number;
    };
}

const LEVEL_ICONS: Record<string, typeof Building2> = {
    COMPANY: Building2,
    DEPARTMENT: Building2,
    TEAM: Users,
    ROLE: Briefcase,
    PERSON: User,
};

const LEVEL_COLORS: Record<string, string> = {
    COMPANY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    DEPARTMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    TEAM: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    ROLE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    PERSON: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_BADGES: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
    DRAFT: { label: "Чернетка", class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: Edit3 },
    PENDING_APPROVAL: { label: "На затвердженні", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
    PUBLISHED: { label: "Опубліковано", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
    ARCHIVED: { label: "В архіві", class: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500", icon: Archive },
};

export default function DocumentsListPage() {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    useEffect(() => {
        fetchDocuments();
    }, [levelFilter, typeFilter, statusFilter]);

    async function fetchDocuments() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (levelFilter) params.append("level", levelFilter);
            if (typeFilter) params.append("type", typeFilter);
            if (statusFilter) params.append("status", statusFilter);

            const res = await fetch(`/api/knowledge-documents?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedByLevel = filteredDocuments.reduce((acc, doc) => {
        const level = doc.level;
        if (!acc[level]) acc[level] = [];
        acc[level].push(doc);
        return acc;
    }, {} as Record<string, KnowledgeDocument[]>);

    const levelOrder = ["COMPANY", "DEPARTMENT", "TEAM", "ROLE", "PERSON"];

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Документи
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Посадові інструкції, SOP, політики компанії
                    </p>
                </div>
                <Link
                    href="/settings/knowledge/documents/new"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Новий документ
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Пошук документів..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="">Всі рівні</option>
                    <option value="COMPANY">Компанія</option>
                    <option value="DEPARTMENT">Департамент</option>
                    <option value="TEAM">Команда</option>
                    <option value="ROLE">Роль</option>
                    <option value="PERSON">Людина</option>
                </select>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="">Всі типи</option>
                    <option value="POLICY">Політика</option>
                    <option value="SOP">SOP</option>
                    <option value="JOB_DESCRIPTION">Посадова інструкція</option>
                    <option value="KPI_GUIDE">KPI Guide</option>
                    <option value="ONBOARDING">Онбординг</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="">Всі статуси</option>
                    <option value="DRAFT">Чернетка</option>
                    <option value="PUBLISHED">Опубліковано</option>
                    <option value="ARCHIVED">В архіві</option>
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Документів ще немає
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Створіть перший документ для вашої команди
                    </p>
                    <Link
                        href="/settings/knowledge/documents/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Створити документ
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {levelOrder.map(level => {
                        const docs = groupedByLevel[level];
                        if (!docs || docs.length === 0) return null;

                        const LevelIcon = LEVEL_ICONS[level] || FileText;

                        return (
                            <div key={level} className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <LevelIcon className="w-4 h-4" />
                                    <span>
                                        {level === "COMPANY" && "Компанія"}
                                        {level === "DEPARTMENT" && "Департамент"}
                                        {level === "TEAM" && "Команда"}
                                        {level === "ROLE" && "Роль"}
                                        {level === "PERSON" && "Людина"}
                                    </span>
                                    <span className="text-gray-400">({docs.length})</span>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                                    {docs.map(doc => {
                                        const statusInfo = STATUS_BADGES[doc.status] || STATUS_BADGES.DRAFT;
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <Link
                                                key={doc.id}
                                                href={`/settings/knowledge/documents/${doc.id}`}
                                                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${LEVEL_COLORS[doc.level]}`}>
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                            {doc.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {doc.type.replace("_", " ")}
                                                            {doc.dept && ` • ${doc.dept.name}`}
                                                            {doc.team && ` • ${doc.team.name}`}
                                                            {doc.jobRole && ` • ${doc.jobRole.name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.class}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                    {doc._count && doc._count.comments > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            💬 {doc._count.comments}
                                                        </span>
                                                    )}
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
