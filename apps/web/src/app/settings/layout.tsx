'use client';





interface SettingsLayoutProps {
    children: React.ReactNode;
}

import AppLayout from '@/components/layout/AppLayout';
import { WizardBanner } from '@/components/wizard/WizardBanner';
import { Suspense } from 'react';

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <AppLayout>
            {children}
        </AppLayout>
    );
}
