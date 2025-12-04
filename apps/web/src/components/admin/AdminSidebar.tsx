'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/internal', icon: LayoutDashboard },
    { label: 'Companies', href: '/internal/companies', icon: Building2 },
    // { label: 'Users', href: '/internal/users', icon: Users }, // Future
    // { label: 'Settings', href: '/internal/settings', icon: Settings }, // Future
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-950 text-slate-300">
            <div className="flex h-16 items-center px-6 font-bold text-white border-b border-slate-800">
                <span className="text-emerald-400 mr-2">⚡</span> Crystal Admin
            </div>

            <div className="flex-1 py-6 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "hover:bg-slate-900 hover:text-white"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Exit Admin
                </Button>
            </div>
        </div>
    );
}
