"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function InviteUserModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerateInvite = async () => {
        if (!email) {
            toast.error("Please enter an email");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/organizations/invite', { email });
            setInviteLink(data.link);
            toast.success("Invite link generated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate invite");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setOpen(false);
        setEmail("");
        setInviteLink("");
        setCopied(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                    <DialogDescription>
                        Generate a secure invite link that expires in 24 hours.
                    </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleGenerateInvite} disabled={loading || !email}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Link
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Invite Link</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={inviteLink}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button size="icon" variant="outline" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This link will expire in 24 hours.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
