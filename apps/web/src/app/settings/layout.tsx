'use client';





interface SettingsLayoutProps {
    children: React.ReactNode;
}

import AppLayout from '@/components/layout/AppLayout';

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <AppLayout>
            {children}
        </AppLayout>
    );
}
