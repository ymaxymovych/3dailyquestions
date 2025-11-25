"use client";

import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { KPITab } from "@/components/settings/KPITab";
import { WorkdayTab } from "@/components/settings/WorkdayTab";
import { RolesTab } from "@/components/settings/RolesTab";
import { IntegrationsTab } from "@/components/settings/IntegrationsTab";
import { AccessTab } from "@/components/settings/AccessTab";

import { ProjectsTab } from "@/components/settings/ProjectsTab";
import { TagsTab } from "@/components/settings/TagsTab";

export default function SettingsPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">User Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile, preferences, and workspace configuration.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="workday">Workday</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="tags">Tags</TabsTrigger>
                    <TabsTrigger value="kpi">KPIs</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="access">Access & Security</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileTab />
                </TabsContent>

                <TabsContent value="workday" className="space-y-4">
                    <WorkdayTab />
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                    <ProjectsTab />
                </TabsContent>

                <TabsContent value="tags" className="space-y-4">
                    <TagsTab />
                </TabsContent>

                <TabsContent value="kpi" className="space-y-4">
                    <KPITab />
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <RolesTab />
                </TabsContent>

                <TabsContent value="access" className="space-y-4">
                    <AccessTab />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                    <IntegrationsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
