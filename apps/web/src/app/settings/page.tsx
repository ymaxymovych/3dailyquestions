"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
    User,
    Briefcase,
    Clock,
    Building2,
    Shield,
    Lock,
    FolderKanban,
    Tags,
    Target,
    Plug,
    Brain,
    ChevronRight,
    Sparkles
} from "lucide-react";

// Import tabs
import { ProfileTab } from "@/components/settings/ProfileTab";
import { KPITab } from "@/components/settings/KPITab";
import { WorkdayTab } from "@/components/settings/WorkdayTab";
import { RolesTab } from "@/components/settings/RolesTab";
import { JobRoleTab } from "@/components/settings/JobRoleTab";
import { IntegrationsTab } from "@/components/settings/IntegrationsTab";
import { AccessTab } from "@/components/settings/AccessTab";
import { ProjectsTab } from "@/components/settings/ProjectsTab";
import { TagsTab } from "@/components/settings/TagsTab";
import { OrganizationTab } from "@/components/settings/OrganizationTab";

// Category and item types
interface SettingsItem {
    id: string;
    label: string;
    icon: any;
    component: React.ComponentType;
    adminOnly?: boolean;
}

interface SettingsCategory {
    id: string;
    label: string;
    icon: any;
    items: SettingsItem[];
    adminOnly?: boolean;
}

const settingsCategories: SettingsCategory[] = [
    {
        id: "personal",
        label: "Personal",
        icon: User,
        items: [
            { id: "profile", label: "Profile", icon: User, component: ProfileTab },
            { id: "job-role", label: "Job Role", icon: Briefcase, component: JobRoleTab },
            { id: "workday", label: "Workday", icon: Clock, component: WorkdayTab },
        ]
    },
    {
        id: "organization",
        label: "Organization",
        icon: Building2,
        adminOnly: true,
        items: [
            { id: "organization", label: "Organization Info", icon: Building2, component: OrganizationTab, adminOnly: true },
            { id: "roles", label: "Roles & Permissions", icon: Shield, component: RolesTab, adminOnly: true },
            { id: "access", label: "Access & Security", icon: Lock, component: AccessTab, adminOnly: true },
        ]
    },
    {
        id: "workspace",
        label: "Workspace",
        icon: FolderKanban,
        items: [
            { id: "projects", label: "Projects", icon: FolderKanban, component: ProjectsTab },
            { id: "tags", label: "Tags", icon: Tags, component: TagsTab },
            { id: "kpi", label: "KPIs", icon: Target, component: KPITab },
        ]
    },
    {
        id: "ai-advisory",
        label: "AI Advisory Board",
        icon: Briefcase,
        adminOnly: true,
        items: [
            { id: "ai-dashboard", label: "AI Features Dashboard", icon: Brain, component: () => null, adminOnly: true },
            { id: "ai-config", label: "AI Provider Config", icon: Brain, component: () => null, adminOnly: true },
            { id: "company", label: "Company Settings", icon: Building2, component: () => null, adminOnly: true },
            { id: "organization", label: "Organization Structure", icon: Building2, component: () => null, adminOnly: true },
            { id: "roles", label: "Job Roles", icon: Briefcase, component: () => null, adminOnly: true },
            { id: "archetypes", label: "Role Archetypes", icon: Briefcase, component: () => null, adminOnly: true },
        ]
    },
    {
        id: "integrations",
        label: "Integrations",
        icon: Plug,
        items: [
            { id: "integrations", label: "Yaware & Others", icon: Plug, component: IntegrationsTab, adminOnly: true },
        ]
    },
    {
        id: "system",
        label: "System",
        icon: Shield,
        items: [
            { id: "system", label: "System Settings", icon: Shield, component: () => null }, // Placeholder, will navigate to /settings/system
        ]
    }
];

export default function SettingsPage() {
    const { user } = useAuth();
    const [selectedItem, setSelectedItem] = useState("profile");
    const [expandedCategories, setExpandedCategories] = useState<string[]>(["personal"]);

    if (!user) return null;

    // Check if user has admin/owner role
    // TODO: Replace with proper RBAC check when roles are fully implemented
    const isAdmin = true; // For now, show all sections to everyone
    // Future: const isAdmin = user.roles?.some(r => ['ADMIN', 'OWNER'].includes(r.name));

    // Filter categories and items based on admin status
    const visibleCategories = settingsCategories
        .filter(cat => !cat.adminOnly || isAdmin)
        .map(cat => ({
            ...cat,
            items: cat.items.filter(item => !item.adminOnly || isAdmin)
        }));

    // Get current selected component
    const currentItem = visibleCategories
        .flatMap(cat => cat.items)
        .find(item => item.id === selectedItem);

    const CurrentComponent = currentItem?.component || ProfileTab;

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r bg-muted/30">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your preferences
                    </p>
                </div>

                <nav className="p-4 space-y-1">
                    {visibleCategories.map((category) => {
                        const CategoryIcon = category.icon;
                        const isExpanded = expandedCategories.includes(category.id);

                        return (
                            <div key={category.id}>
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        isExpanded && "bg-accent/50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <CategoryIcon className="h-4 w-4" />
                                        <span>{category.label}</span>
                                    </div>
                                    <ChevronRight
                                        className={cn(
                                            "h-4 w-4 transition-transform",
                                            isExpanded && "rotate-90"
                                        )}
                                    />
                                </button>

                                {/* Category Items */}
                                {isExpanded && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {category.items.map((item) => {
                                            const ItemIcon = item.icon;
                                            const isSelected = selectedItem === item.id;

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        // Special handling for dedicated pages
                                                        if (item.id === 'archetypes') {
                                                            window.location.href = '/settings/archetypes';
                                                        } else if (item.id === 'company') {
                                                            window.location.href = '/settings/company';
                                                        } else if (item.id === 'organization') {
                                                            window.location.href = '/settings/organization';
                                                        } else if (item.id === 'roles') {
                                                            window.location.href = '/settings/roles';
                                                        } else if (item.id === 'ai-dashboard') {
                                                            window.location.href = '/settings/ai-advisory';
                                                        } else if (item.id === 'ai-config') {
                                                            window.location.href = '/settings/ai-config';
                                                        } else {
                                                            setSelectedItem(item.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground"
                                                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                                    )}
                                                >
                                                    <ItemIcon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t mt-auto">
                    <button
                        onClick={() => window.location.href = '/setup-wizard'}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600"
                    >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Launch Setup Wizard</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-8">
                <div className="max-w-4xl">
                    {/* Breadcrumb */}
                    <div className="mb-6 text-sm text-muted-foreground">
                        <span>Settings</span>
                        {currentItem && (
                            <>
                                <span className="mx-2">/</span>
                                <span className="text-foreground font-medium">{currentItem.label}</span>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <CurrentComponent />
                </div>
            </main>
        </div >
    );
}
