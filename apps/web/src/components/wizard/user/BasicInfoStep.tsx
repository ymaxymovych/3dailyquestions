'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import wizardApi from '@/lib/wizardApi';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface BasicInfoStepProps {
    onComplete: () => void;
}

export function BasicInfoStep({ onComplete }: BasicInfoStepProps) {
    const { user, refreshProfile } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        jobTitle: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                bio: user.profile?.bio || '',
                jobTitle: user.profile?.jobTitle || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await wizardApi.patch('/user/profile', formData);
            await refreshProfile();
            toast.success('Profile updated');
            onComplete();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {user?.fullName?.[0] || <User />}
                    </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change Photo</Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                        placeholder="e.g. Senior Product Manager"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Bio (Optional)</Label>
                    <Textarea
                        placeholder="Tell us a bit about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <Button className="w-full" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save & Continue'}
                </Button>
            </div>
        </div>
    );
}
