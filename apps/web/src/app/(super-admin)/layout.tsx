import SuperAdminGuard from '@/components/auth/SuperAdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SuperAdminGuard>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {children}
                </main>
            </div>
        </SuperAdminGuard>
    );
}
