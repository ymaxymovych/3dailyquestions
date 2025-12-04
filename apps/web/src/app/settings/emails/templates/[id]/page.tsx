"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    Send,
    Eye,
    FileText,
    Bold,
    Italic,
    Link2,
    Copy,
    Search,
    CheckCircle2,
    X
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
    variables: string[];
    templates: {
        uk: { subject: string; body: string };
        en: { subject: string; body: string };
    };
}

type Language = "uk" | "en";

export default function TemplateEditorPage() {
    const router = useRouter();
    const params = useParams();
    const templateId = params.id as string;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [template, setTemplate] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lang, setLang] = useState<Language>("uk");
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [isDirty, setIsDirty] = useState(false);

    // Editable fields
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    // Test modal
    const [showTestModal, setShowTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [sendingTest, setSendingTest] = useState(false);

    // Variable search
    const [varSearch, setVarSearch] = useState("");

    // Toast
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        async function fetchTemplate() {
            try {
                const response = await fetch(`/api/email-templates/${templateId}`);
                if (response.ok) {
                    const data = await response.json();
                    setTemplate(data);
                } else {
                    router.push("/settings/emails/templates");
                }
            } catch (error) {
                console.error("Failed to fetch template:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTemplate();
    }, [templateId, router]);

    // Sync state when template or lang changes
    useEffect(() => {
        if (template?.templates?.[lang]) {
            setSubject(template.templates[lang].subject);
            setBody(template.templates[lang].body);
            setIsDirty(false);
        }
    }, [template, lang]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleTextChange = (field: "subject" | "body", value: string) => {
        if (field === "subject") setSubject(value);
        else setBody(value);
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!template) return;
        setSaving(true);

        try {
            const updatedTemplates = {
                ...template.templates,
                [lang]: { subject, body },
            };

            const response = await fetch(`/api/email-templates/${template.code}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templates: updatedTemplates }),
            });

            if (response.ok) {
                const updated = await response.json();
                setTemplate(updated);
                setIsDirty(false);
                showToast("Changes saved successfully", "success");
            } else {
                showToast("Failed to save changes", "error");
            }
        } catch (error) {
            showToast("Failed to save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const insertAtCursor = (textToInsert: string) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = body.substring(0, start) + textToInsert + body.substring(end);
            setBody(newText);
            setIsDirty(true);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
            }, 0);
        }
    };

    const handleVariableInsert = (variable: string) => {
        insertAtCursor(`{{${variable}}}`);
    };

    const handleToolbarAction = (action: "bold" | "italic" | "link") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = body.substring(start, end);
        let insertion = "";

        if (action === "bold") insertion = `**${selection || "text"}**`;
        if (action === "italic") insertion = `*${selection || "text"}*`;
        if (action === "link") insertion = `[${selection || "text"}](url)`;

        const newText = body.substring(0, start) + insertion + body.substring(end);
        setBody(newText);
        setIsDirty(true);
    };

    const handleBack = () => {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                router.push("/settings/emails/templates");
            }
        } else {
            router.push("/settings/emails/templates");
        }
    };

    const handleSendTest = async () => {
        if (!testEmail) {
            showToast("Please enter an email address", "error");
            return;
        }
        setSendingTest(true);

        try {
            const response = await fetch(`/api/email-templates/${template?.code}/test`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: testEmail, language: lang }),
            });

            if (response.ok) {
                showToast(`Test email sent to ${testEmail}`, "success");
                setShowTestModal(false);
                setTestEmail("");
            } else {
                showToast("Failed to send test email", "error");
            }
        } catch (error) {
            showToast("Failed to send test email", "error");
        } finally {
            setSendingTest(false);
        }
    };

    const renderPreview = (text: string) => {
        if (!text) return null;
        return text.split("\n").map((line, lineIdx) => (
            <div key={lineIdx} className="min-h-[1.5em]">
                {line.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
                        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
                    }
                    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
                        const match = part.match(/\[(.*?)\]\((.*?)\)/);
                        if (match) {
                            return (
                                <a key={i} href="#" className="text-blue-600 hover:underline" onClick={(e) => e.preventDefault()}>
                                    {match[1]}
                                </a>
                            );
                        }
                    }
                    return part;
                })}
            </div>
        ));
    };

    const filteredVariables = template?.variables?.filter((v) =>
        v.toLowerCase().includes(varSearch.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!template) {
        return <div className="text-center py-12">Template not found</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={handleBack}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-2 flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to list
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {template.name}
                        </h1>
                        {isDirty && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                Unsaved
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {template.description}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowTestModal(true)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send Test
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col">
                        {/* Tabs Header */}
                        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 flex items-center justify-between">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab("write")}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "write"
                                            ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800"
                                            : "border-transparent text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    <FileText className="w-4 h-4" /> Write
                                </button>
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === "preview"
                                            ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800"
                                            : "border-transparent text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    <Eye className="w-4 h-4" /> Preview
                                </button>
                            </div>
                            <div className="flex bg-slate-200 dark:bg-slate-700 rounded p-0.5">
                                <button
                                    onClick={() => setLang("uk")}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${lang === "uk"
                                            ? "bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    🇺🇦 UA
                                </button>
                                <button
                                    onClick={() => setLang("en")}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${lang === "en"
                                            ? "bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    🇺🇸 EN
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            {activeTab === "write" ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => handleTextChange("subject", e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Body
                                            </label>
                                            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md p-1 gap-1">
                                                <button
                                                    onClick={() => handleToolbarAction("bold")}
                                                    className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200"
                                                    title="Bold"
                                                >
                                                    <Bold className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToolbarAction("italic")}
                                                    className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200"
                                                    title="Italic"
                                                >
                                                    <Italic className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToolbarAction("link")}
                                                    className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-200"
                                                    title="Link"
                                                >
                                                    <Link2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={body}
                                            onChange={(e) => handleTextChange("body", e.target.value)}
                                            className="flex-1 w-full p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed min-h-[400px]"
                                        />
                                        <p className="text-xs text-slate-400 mt-2 text-right">
                                            Markdown supported
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-8 h-full">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        {subject}
                                    </h2>
                                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-sans text-sm space-y-2">
                                        {renderPreview(body)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Variables */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                            Available Variables
                        </h3>
                        <div className="mb-3 relative">
                            <input
                                type="text"
                                placeholder="Search variables..."
                                value={varSearch}
                                onChange={(e) => setVarSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                            />
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Click to insert into the body.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {filteredVariables.length > 0 ? (
                                filteredVariables.map((variable) => (
                                    <button
                                        key={variable}
                                        onClick={() => handleVariableInsert(variable)}
                                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-mono rounded border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-1 group"
                                    >
                                        <span>{`{{${variable}}}`}</span>
                                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">
                                    No variables match your search.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Configuration */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                            Configuration
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">ID</span>
                                <code className="text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                    {template.code}
                                </code>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Trigger</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{template.triggers}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">Recipients</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {template.recipients?.map((r) => (
                                        <span key={r} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Status</span>
                                    <div className={`w-3 h-3 rounded-full ${template.enabled ? "bg-green-500" : "bg-red-500"}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Email Modal */}
            {showTestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Send Test Email</h3>
                            <button onClick={() => setShowTestModal(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Enter an email address to send a preview of the <strong>{lang.toUpperCase()}</strong> template.
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                    Recipient Email
                                </label>
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowTestModal(false)}
                                    className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendTest}
                                    disabled={sendingTest}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {sendingTest ? "Sending..." : "Send Test"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-fade-in-up ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {toast.message}
                </div>
            )}
        </div>
    );
}
