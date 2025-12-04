"use client";

import Link from "next/link";
import {
    BookOpen,
    FileText,
    Target,
    Plus,
    ChevronRight,
    FolderOpen
} from "lucide-react";

export default function KnowledgeHubPage() {
    const sections = [
        {
            title: "Документи",
            description: "Посадові інструкції, SOP, політики",
            icon: FileText,
            href: "/settings/knowledge/documents",
            color: "bg-indigo-500",
        },
        {
            title: "Ролі та KPI",
            description: "Архетипи ролей з визначеними KPI",
            icon: Target,
            href: "/settings/roles",
            color: "bg-green-500",
        },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            База знань
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Управління документами та інструкціями
                        </p>
                    </div>
                </div>
                <Link
                    href="/settings/knowledge/documents/new"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Новий документ
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2">
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all"
                    >
                        <div className={`p-3 rounded-xl ${section.color} text-white`}>
                            <section.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {section.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {section.description}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <FolderOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Структура документів
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Документи організовані за рівнями:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <strong>Компанія</strong> — політики, загальні правила
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <strong>Департамент</strong> — специфіка роботи
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <strong>Команда</strong> — локальні доповнення
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                <strong>Роль</strong> — посадові інструкції
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <strong>Людина</strong> — персональні цілі
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
