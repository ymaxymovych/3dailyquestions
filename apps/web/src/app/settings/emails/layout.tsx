"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Mail,
    History,
    Users,
    Settings,
    ChevronLeft
} from "lucide-react";

const emailNavItems = [
    { href: "/settings/emails", label: "Dashboard", icon: LayoutDashboard },
    { href: "/settings/emails/templates", label: "Templates", icon: Mail },
    { href: "/settings/emails/logs", label: "Logs", icon: History },
    { href: "/settings/emails/subscribers", label: "Subscribers", icon: Users },
    { href: "/settings/emails/settings", label: "Settings", icon: Settings },
];

export default function EmailsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/settings"
                                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Settings
                            </Link>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-600" />
                                Email Management
                            </h1>
                        </div>
                    </div>

                    {/* Sub-navigation */}
                    <nav className="flex space-x-1 -mb-px">
                        {emailNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href ||
                                (item.href !== "/settings/emails" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                        isActive
                                            ? "border-blue-600 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
