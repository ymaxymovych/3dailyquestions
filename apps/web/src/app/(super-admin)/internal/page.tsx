import { getAdminStats } from '@/actions/admin/dashboard';
import { ActivityChart } from '@/components/admin/ActivityChart';
import { ProblematicCompanies } from '@/components/admin/ProblematicCompanies';
import { StatsCards } from '@/components/admin/StatsCards';

export default async function AdminDashboardPage() {
    const data = await getAdminStats();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                        PROD
                    </span>
                </div>
            </div>

            <StatsCards stats={data.stats} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <ActivityChart data={data.activity} />
                <ProblematicCompanies companies={data.problematicCompanies} />
            </div>
        </div>
    );
}
