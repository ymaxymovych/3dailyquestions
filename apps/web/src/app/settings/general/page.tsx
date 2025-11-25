'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getProfile, updateProfile, UserProfile } from '@/lib/user-settings';
import { Loader2 } from 'lucide-react';

export default function GeneralSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, setValue, reset } = useForm<UserProfile>();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await getProfile();
            reset(profile);
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: UserProfile) => {
        setSaving(true);
        try {
            await updateProfile(data);
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Update your personal information and public profile.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input id="jobTitle" placeholder="e.g. Senior Software Engineer" {...register('jobTitle')} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" placeholder="e.g. Engineering" {...register('department')} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio / Role Description</Label>
                            <Textarea
                                id="bio"
                                placeholder="Describe your role and responsibilities..."
                                className="min-h-[100px]"
                                {...register('bio')}
                            />
                            <p className="text-xs text-muted-foreground">
                                Briefly describe what you do. This helps with AI suggestions.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" placeholder="+380..." {...register('phone')} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="avatarUrl">Avatar URL</Label>
                            <Input id="avatarUrl" placeholder="https://..." {...register('avatarUrl')} />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
