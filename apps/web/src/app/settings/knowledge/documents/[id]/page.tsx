"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Wand2,
    Eye,
    CheckCircle,
    Clock,
    Archive,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Send
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface KnowledgeDocument {
    id: string;
    title: string;
    content: string;
    type: string;
    level: string;
    status: string;
    effectiveAt: string | null;
    version: number;
    createdAt: string;
    updatedAt: string;
    isAcknowledged?: boolean;
    acknowledgedAt?: string | null;
    _count?: {
        acknowledgments: number;
        comments: number;
    };
}

interface Comment {
    id: string;
    type: string;
    text: string;
    status: string;
    createdAt: string;
    user?: { fullName: string; email: string };
}

export default function DocumentEditorPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const isNew = id === "new";

    const [document, setDocument] = useState<KnowledgeDocument | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("JOB_DESCRIPTION");
    const [level, setLevel] = useState("ROLE");
    const [status, setStatus] = useState("DRAFT");

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [commentType, setCommentType] = useState<"question" | "suggestion">("question");
    const [scaffolding, setScaffolding] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetchDocument();
            fetchComments();
        }
    }, [id, isNew]);

    async function fetchDocument() {
        try {
            const res = await fetch(`/api/knowledge-documents/${id}`);
            if (res.ok) {
                const data = await res.json();
                setDocument(data);
                setTitle(data.title);
                setContent(data.content);
                setType(data.type);
                setLevel(data.level);
                setStatus(data.status);
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchComments() {
        try {
            const res = await fetch(`/api/knowledge-documents/${id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    }

    async function handleSave(newStatus?: string) {
        setSaving(true);
        try {
            const url = isNew ? "/api/knowledge-documents" : `/api/knowledge-documents/${id}`;
            const method = isNew ? "POST" : "PATCH";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    type,
                    level,
                    status: newStatus || status,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (isNew) {
                    router.push(`/settings/knowledge/documents/${data.id}`);
                } else {
                    setDocument(data);
                    if (newStatus) setStatus(newStatus);
                }
            }
        } catch (error) {
            console.error("Error saving document:", error);
        } finally {
            setSaving(false);
        }
    }

    async function handleScaffold() {
        setScaffolding(true);
        try {
            const res = await fetch("/api/ai/scaffold-document", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleKeyword: title || "Нова роль",
                    documentType: type,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setContent(data.scaffold);
            }
        } catch (error) {
            console.error("Error generating scaffold:", error);
        } finally {
            setScaffolding(false);
        }
    }

    async function handleAddComment() {
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/knowledge-documents/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: commentType,
                    text: newComment,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setComments([data, ...comments]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/settings/knowledge/documents"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isNew ? "Новий документ" : "Редагування документа"}
                        </h1>
                        {document && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Версія {document.version} • Оновлено {new Date(document.updatedAt).toLocaleDateString("uk")}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && status === "DRAFT" && (
                        <button
                            onClick={() => handleSave("PUBLISHED")}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Опублікувати
                        </button>
                    )}
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Збереження..." : "Зберегти"}
                    </button>
                </div>
            </div>

            {/* Metadata */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Назва
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Назва документа"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Тип
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="JOB_DESCRIPTION">Посадова інструкція</option>
                        <option value="SOP">SOP</option>
                        <option value="POLICY">Політика</option>
                        <option value="KPI_GUIDE">KPI Guide</option>
                        <option value="ONBOARDING">Онбординг</option>
                        <option value="OTHER">Інше</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Рівень
                    </label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="COMPANY">Компанія</option>
                        <option value="DEPARTMENT">Департамент</option>
                        <option value="TEAM">Команда</option>
                        <option value="ROLE">Роль</option>
                        <option value="PERSON">Людина</option>
                    </select>
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleScaffold}
                            disabled={scaffolding}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
                        >
                            <Wand2 className="w-4 h-4" />
                            {scaffolding ? "Генерація..." : "🤖 Згенерувати шаблон"}
                        </button>
                    </div>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${showPreview
                                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        <Eye className="w-4 h-4" />
                        Прев&apos;ю
                    </button>
                </div>

                {/* Content */}
                <div className={`grid ${showPreview ? "grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700" : ""}`}>
                    <div className="p-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Вміст документа (Markdown)..."
                            className="w-full h-[500px] p-4 border-0 bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none font-mono text-sm"
                        />
                    </div>
                    {showPreview && (
                        <div className="p-4 overflow-auto max-h-[532px] prose dark:prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{content || "*Немає вмісту*"}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            {!isNew && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Коментарі та пропозиції
                            </span>
                            {comments.length > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                    {comments.length}
                                </span>
                            )}
                        </div>
                        {showComments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {showComments && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                            {/* Add Comment */}
                            <div className="flex gap-2">
                                <select
                                    value={commentType}
                                    onChange={(e) => setCommentType(e.target.value as "question" | "suggestion")}
                                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                                >
                                    <option value="question">❓ Запитання</option>
                                    <option value="suggestion">💡 Пропозиція</option>
                                </select>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Напишіть коментар..."
                                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Comments List */}
                            {comments.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    Коментарів ще немає
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                        >
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                <span>{comment.type === "question" ? "❓" : "💡"}</span>
                                                <span className="font-medium">{comment.user?.fullName || "Користувач"}</span>
                                                <span>•</span>
                                                <span>{new Date(comment.createdAt).toLocaleDateString("uk")}</span>
                                            </div>
                                            <p className="text-gray-900 dark:text-white">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
