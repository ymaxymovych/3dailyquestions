'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar'; // Re-use sidebar content for mobile
import { ModeToggle } from '@/components/mode-toggle';

export function Header() {
    const { user, logout } = useAuth();

    const [orgName, setOrgName] = useState<string>('');

    useEffect(() => {
        if (user?.orgId) {
            api.get(`/organizations/${user.orgId}`)
                .then(({ data }) => setOrgName(data.name))
                .catch(console.error);
        }
    }, [user?.orgId]);

    return (
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <Sidebar />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1 flex items-center gap-2">
                {orgName && (
                    <span className="text-sm font-medium text-muted-foreground border px-2 py-1 rounded-md bg-muted/50">
                        {orgName}
                    </span>
                )}
            </div>
            <ModeToggle />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://github.com/shadcn.png" alt={user?.fullName} />
                            <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
