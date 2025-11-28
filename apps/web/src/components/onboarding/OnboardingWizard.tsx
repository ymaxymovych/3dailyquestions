"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, UserPlus, PlayCircle, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

export function OnboardingWizard() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Create Org State
    const [orgName, setOrgName] = useState("");

    // Invite State
    const [inviteToken, setInviteToken] = useState(searchParams.get("token") || "");
    const [inviteDetails, setInviteDetails] = useState<any>(null);

    // Discovery State
    const [suggestedOrgs, setSuggestedOrgs] = useState<any[]>([]);

    useEffect(() => {
        if (inviteToken) {
            validateInvite(inviteToken);
        }
        fetchSuggestedOrgs();
    }, [inviteToken]);

    const fetchSuggestedOrgs = async () => {
        try {
            const { data } = await api.get('/organizations/suggested');
            setSuggestedOrgs(data);
        } catch (error) {
            console.error("Failed to fetch suggested orgs", error);
        }
    };

    const validateInvite = async (token: string) => {
        try {
            const { data } = await api.get(`/organizations/invite/${token}`);
            setInviteDetails(data);
        } catch (error) {
            console.error("Invalid invite", error);
            // toast.error("Invalid or expired invite link");
        }
    };

    const handleCreateOrg = async () => {
        if (!orgName) return;
        setLoading(true);
        try {
            await api.post('/organizations', { name: orgName });
            await refreshProfile();
            toast.success("Organization created!");
            router.push('/dashboard/manager');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create organization");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptInvite = async () => {
        if (!inviteToken) return;
        setLoading(true);
        try {
            await api.post('/organizations/invite/accept', { token: inviteToken });
            await refreshProfile();
            toast.success(`Joined ${inviteDetails?.name}!`);
            router.push('/daily-report');
        } catch (error) {
            console.error(error);
            toast.error("Failed to join organization");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoMode = async () => {
        setLoading(true);
        try {
            await api.post('/organizations/demo');
            await refreshProfile();
            toast.success("Demo environment ready!");
            router.push('/dashboard/manager');
        } catch (error) {
            console.error(error);
            toast.error("Failed to setup demo");
        } finally {
            setLoading(false);
        }
    };

    if (inviteDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>You've been invited!</CardTitle>
                        <CardDescription>
                            {inviteDetails.inviter} invited you to join <strong>{inviteDetails.name}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <Building2 className="h-10 w-10 text-primary" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleAcceptInvite} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Join {inviteDetails.name}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome to Crystal</CardTitle>
                    <CardDescription>
                        Let's get you set up.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {suggestedOrgs.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Found organizations for your domain:</h3>
                            <div className="space-y-3">
                                {suggestedOrgs.map(org => (
                                    <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                                        <div>
                                            <div className="font-medium">{org.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span title="Owner">👑 {org.owner.email}</span>
                                                <span className="flex items-center gap-1" title="Employees">
                                                    <Users className="h-3 w-3" /> {org.sizeRange}
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" disabled>Request Join</Button>
                                    </div>
                                ))}
                            </div>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or proceed manually</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="create">Create</TabsTrigger>
                            <TabsTrigger value="join">Have Code</TabsTrigger>
                            <TabsTrigger value="demo">Demo</TabsTrigger>
                        </TabsList>

                        <TabsContent value="create" className="space-y-4">
                            <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/20">
                                <Building2 className="h-10 w-10 mb-2 text-primary" />
                                <h3 className="font-medium">Create New Organization</h3>
                                <p className="text-sm text-muted-foreground text-center">
                                    Best for managers and business owners.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orgName">Company Name</Label>
                                <Input
                                    id="orgName"
                                    placeholder="Acme Corp"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleCreateOrg}
                                disabled={loading || !orgName}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Workspace
                            </Button>
                        </TabsContent>

                        <TabsContent value="join" className="space-y-4">
                            <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/20">
                                <UserPlus className="h-10 w-10 mb-2 text-primary" />
                                <h3 className="font-medium">Enter Invite Code</h3>
                                <p className="text-sm text-muted-foreground text-center">
                                    If you have a legacy code or link.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="inviteCode">Invite Token</Label>
                                <Input
                                    id="inviteCode"
                                    placeholder="Paste token here"
                                    value={inviteToken}
                                    onChange={(e) => setInviteToken(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => validateInvite(inviteToken)}
                                disabled={loading || !inviteToken}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Check Invite
                            </Button>
                        </TabsContent>

                        <TabsContent value="demo" className="space-y-4">
                            <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/20">
                                <PlayCircle className="h-10 w-10 mb-2 text-primary" />
                                <h3 className="font-medium">Try Demo Mode</h3>
                                <p className="text-sm text-muted-foreground text-center">
                                    We'll create a sandbox with fake data so you can explore.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={handleDemoMode}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Demo
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
