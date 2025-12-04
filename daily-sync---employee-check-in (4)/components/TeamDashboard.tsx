
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Filter, ChevronDown, Bell } from 'lucide-react';
import { MOCK_TEAM } from '../constants';
import { Department } from '../types';
import { DashboardCard } from './DashboardCard';

export const TeamDashboard = () => {
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set());
  const [helpOffers, setHelpOffers] = useState<Set<string>>(new Set());
  const [nudgedUsers, setNudgedUsers] = useState<Set<string>>(new Set());

  const toggleLike = (reportId: string) => {
    const newLikes = new Set(likedReports);
    if (newLikes.has(reportId)) {
        newLikes.delete(reportId);
    } else {
        newLikes.add(reportId);
    }
    setLikedReports(newLikes);
  };

  const toggleHelpOffer = (reportId: string) => {
    const newOffers = new Set(helpOffers);
    if (newOffers.has(reportId)) {
        newOffers.delete(reportId);
    } else {
        newOffers.add(reportId);
    }
    setHelpOffers(newOffers);
  };

  const handleNudge = (reportId: string) => {
      // Simulate sending a notification
      const newNudges = new Set(nudgedUsers);
      newNudges.add(reportId);
      setNudgedUsers(newNudges);
      
      // Reset after 3 seconds for demo purposes
      setTimeout(() => {
          const reset = new Set(nudgedUsers);
          reset.delete(reportId);
          setNudgedUsers(reset);
      }, 3000);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Group employees by department if "All" is selected, otherwise filter
  const departments: Department[] = ['Engineering', 'Design', 'Sales', 'Marketing'];
  const visibleDepartments = selectedDept === 'All' ? departments : [selectedDept];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Пульс Команди</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Огляд активності за тиждень 4-8 грудня</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span>{selectedDept === 'All' ? 'Всі відділи' : selectedDept}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {/* Dropdown would go here in real impl, simulating change via cycling for demo */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 hidden group-focus-within:block group-hover:block">
                    {['All', ...departments].map(dept => (
                        <button 
                            key={dept}
                            onClick={() => setSelectedDept(dept as any)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                            {dept}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Picker (Mock) */}
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <span>Тиждень: 04 Dec - 08 Dec</span>
            </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="space-y-8">
        {visibleDepartments.map(dept => {
            const deptEmployees = MOCK_TEAM.filter(e => e.department === dept);
            if (deptEmployees.length === 0) return null;

            return (
                <div key={dept} className="space-y-4">
                    {/* Swimlane Header */}
                    <div className="flex items-center gap-2 px-2">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                            {dept}
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                    </div>

                    {/* The Grid */}
                    <div className="grid grid-cols-[200px_1fr] gap-6 overflow-x-auto pb-4">
                        {/* Headers (Days) */}
                        <div className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 pt-8"></div> {/* Spacer for Employee Info */}
                        <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                            {days.map(day => (
                                <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Rows */}
                        {deptEmployees.map(employee => (
                            <React.Fragment key={employee.id}>
                                {/* Employee Info Sidebar (Sticky) */}
                                <div className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 pr-4 flex flex-col justify-start pt-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="relative">
                                            <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{employee.name}</div>
                                            <div className="text-xs text-slate-500">{employee.role}</div>
                                        </div>
                                    </div>
                                    {/* Mini Stats */}
                                    <div className="mt-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Avg Focus</div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[70%]"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cards Grid */}
                                <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                                    {days.map(day => {
                                        const report = employee.weeklyReports[day];
                                        const reportId = `${employee.id}-${day}`;
                                        
                                        if (!report) {
                                            const isNudged = nudgedUsers.has(reportId);
                                            return (
                                                <div key={reportId} className="h-full min-h-[140px] rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col items-center justify-center gap-2 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <span className="text-xs text-slate-300 dark:text-slate-700 font-medium select-none group-hover:hidden">Empty</span>
                                                    
                                                    {/* Nudge Button (Visible on Hover) */}
                                                    <button 
                                                        onClick={() => handleNudge(reportId)}
                                                        disabled={isNudged}
                                                        className={`hidden group-hover:flex flex-col items-center gap-1 transition-all ${isNudged ? 'text-green-500 cursor-default' : 'text-blue-500 hover:scale-105'}`}
                                                    >
                                                        <Bell className={`w-5 h-5 ${isNudged ? 'fill-current' : ''}`} />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                                            {isNudged ? 'Sent!' : 'Nudge'}
                                                        </span>
                                                    </button>
                                                </div>
                                            );
                                        }

                                        return (
                                            <DashboardCard 
                                                key={reportId}
                                                report={report}
                                                onLike={() => toggleLike(reportId)}
                                                isLiked={likedReports.has(reportId)}
                                                onHelpOffer={() => toggleHelpOffer(reportId)}
                                                hasHelpOffer={helpOffers.has(reportId)}
                                            />
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
