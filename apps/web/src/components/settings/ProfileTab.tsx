"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

interface ProfileForm {
    fullName: string;
    jobTitle: string;
    department: string;
    bio: string;
    phone: string;
    roleDescription: string;
    resumeUrl: string;
}

export function ProfileTab() {
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, setValue, reset } = useForm<ProfileForm>();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await api.get("/user-admin/profile");
            if (data.profile) {
                reset({
                    fullName: data.profile.user?.fullName || "", // Assuming user relation is included or fetched separately
                    jobTitle: data.profile.jobTitle || "",
                    department: data.profile.department || "",
                    bio: data.profile.bio || "",
                    phone: data.profile.phone || "",
                    roleDescription: data.profile.roleDescription || "",
                    resumeUrl: data.profile.resumeUrl || "",
                });
            }
        } catch (error) {
            console.error(error);
            // toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: ProfileForm) => {
        try {
            await api.put("/user-admin/profile", values);
            toast.success("Profile updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your public profile and contact info.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input id="jobTitle" {...register("jobTitle")} placeholder="Software Engineer" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" {...register("department")} placeholder="Engineering" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...register("phone")} placeholder="+380..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" {...register("bio")} placeholder="Short bio..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="roleDescription">My Role Description (Actual)</Label>
                            <Textarea
                                id="roleDescription"
                                {...register("roleDescription")}
                                placeholder="Describe what you actually do daily..."
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-muted-foreground">This is your self-reported role description.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resumeUrl">Resume / CV Link</Label>
                            <Input id="resumeUrl" {...register("resumeUrl")} placeholder="https://..." />
                        </div>

                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
