'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Ensure your account is using a long, random password to stay secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current">Current Password</Label>
                            <Input id="current" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input id="new" type="password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm">Confirm New Password</Label>
                            <Input id="confirm" type="password" />
                        </div>
                        <div className="flex justify-end">
                            <Button disabled>Update Password (Coming Soon)</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                        Manage devices where you are currently logged in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Session management is coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
