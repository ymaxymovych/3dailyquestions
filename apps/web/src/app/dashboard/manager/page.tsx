"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, AlertTriangle, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getTeamReports, getTeamSummary, type TeamMemberReport, type TeamSummary } from '@/lib/manager-dashboard';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { EmployeeReportCard } from '@/components/dashboard/EmployeeReportCard';
import { ReportDetailsModal } from '@/components/dashboard/ReportDetailsModal';
import { ManagerDigestPanel } from '@/components/dashboard/ManagerDigestPanel';

function ManagerDashboardContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [date, setDate] = useState<Date>(new Date());
    const [teamReports, setTeamReports] = useState<TeamMemberReport[]>([]);
    const [summary, setSummary] = useState<TeamSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'not_submitted'>('all');
    const [attentionFilter, setAttentionFilter] = useState(false);
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<TeamMemberReport | null>(null);

    useEffect(() => {
        if (!user) return;
        loadDashboardData();
    }, [user, date, statusFilter, attentionFilter]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');

            const filters: any = {
                date: dateStr,
                status: statusFilter,
            };

            if (attentionFilter) {
                filters.hasHelpRequest = true;
            }

            const [reportsData, summaryData] = await Promise.all([
                getTeamReports(filters),
                getTeamSummary(dateStr),
            ]);

            setTeamReports(reportsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = teamReports.filter(report => {
        // Quick filter from summary cards
        if (quickFilter) {
            if (quickFilter === 'submitted' && report.status !== 'submitted') return false;
            if (quickFilter === 'highRisk' && report.aiFlags?.riskLevel !== 'high') return false;
            if (quickFilter === 'needsAttention' &&
                report.aiFlags?.riskLevel !== 'high' &&
                report.aiFlags?.riskLevel !== 'medium') return false;
            if (quickFilter === 'bigTask' && !report.hasBigTask) return false;
        }

        // Search query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            report.userName.toLowerCase().includes(query) ||
            report.email.toLowerCase().includes(query) ||
            report.position.toLowerCase().includes(query)
        );
    });

    const handleSummaryClick = (filterType: 'submitted' | 'highRisk' | 'needsAttention' | 'bigTask') => {
        // Toggle filter if clicking the same one, otherwise set new filter
        setQuickFilter(prev => prev === filterType ? null : filterType);
        // Reset other filters when using quick filter
        setStatusFilter('all');
        setAttentionFilter(false);
    };

    const handleDateChange = (days: number) => {
        const newDate = addDays(date, days);
        setDate(newDate);
    };

    if (!user) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <p>Please log in to view the dashboard</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
                        <p className="text-muted-foreground">Team daily reports overview</p>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDateChange(-1)}
                        >
                            ←
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP', { locale: uk }) : <span>Оберіть дату</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => newDate && setDate(newDate)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDateChange(1)}
                        >
                            →
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                {summary && <DashboardSummary summary={summary} onFilterClick={handleSummaryClick} />}

                {/* Manager Digest - AI-powered team insights */}
                <ManagerDigestPanel date={date} />

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            {/* Search */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Пошук по імені, email, посаді..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Статус звіту" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Усі</SelectItem>
                                    <SelectItem value="submitted">Заповнив</SelectItem>
                                    <SelectItem value="not_submitted">Не заповнив</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Attention Filter */}
                            <Button
                                variant={attentionFilter ? "default" : "outline"}
                                onClick={() => setAttentionFilter(!attentionFilter)}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Потрібна увага
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Employee List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p>Завантаження...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Немає даних для відображення
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredReports.map((report) => (
                            <EmployeeReportCard
                                key={report.userId}
                                report={report}
                                onClick={() => setSelectedEmployee(report)}
                            />
                        ))}
                    </div>
                )}

                {/* Report Details Modal */}
                {selectedEmployee && (
                    <ReportDetailsModal
                        employee={selectedEmployee}
                        onClose={() => setSelectedEmployee(null)}
                    />
                )}
            </div>
        </AppLayout>
    );
}

export default function ManagerDashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <ManagerDashboardContent />
        </Suspense>
    );
}
