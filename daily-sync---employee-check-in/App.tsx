
import React, { useState, useEffect } from 'react';
import { CalendarDays, Save, Moon, Sun, Menu, ChevronRight, Plug, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { YesterdayCard } from './components/YesterdayCard';
import { TodayCard } from './components/TodayCard';
import { HelpCard } from './components/HelpCard';
import { ContextPanel } from './components/ContextPanel';
import { INITIAL_STATE } from './constants';
import { DailyReportState, TaskStatus } from './types';

const STORAGE_KEY = 'daily-sync-report-draft';

function App() {
  const [reportState, setReportState] = useState<DailyReportState>(INITIAL_STATE);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [hasIntegrations, setHasIntegrations] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setReportState(parsed);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportState));
  }, [reportState]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleTaskStatusChange = (id: string, status: TaskStatus) => {
    setReportState(prev => ({
      ...prev,
      yesterday: {
        ...prev.yesterday,
        plannedTasks: prev.yesterday.plannedTasks.map(t => 
          t.id === id ? { ...t, status } : t
        )
      }
    }));
  };

  const handleTaskCommentChange = (id: string, comment: string) => {
    setReportState(prev => ({
      ...prev,
      yesterday: {
        ...prev.yesterday,
        plannedTasks: prev.yesterday.plannedTasks.map(t => 
          t.id === id ? { ...t, comment } : t
        )
      }
    }));
  };

  const updateYesterdayField = (field: 'unplannedWork' | 'summary' | 'smallTasks' | 'metrics', value: string) => {
     setReportState(prev => ({
        ...prev,
        yesterday: { ...prev.yesterday, [field]: value }
     }));
  };

  // Modified to handle boolean for calendar booking
  const updateTodayField = (field: string, value: string | boolean) => {
    setReportState(prev => ({
        ...prev,
        today: { ...prev.today, [field]: value }
    }));
  };

  const updateHelpField = (value: string) => {
    setReportState(prev => ({
        ...prev,
        help: { blockers: value }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
                <CalendarDays className="w-5 h-5 text-white" />
             </div>
             <div>
               <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Щоденний звіт</h1>
               <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <button className="hover:text-blue-600 transition-colors">
                     <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span>Сьогодні: середа, 3 грудня</span>
                  <button className="hover:text-blue-600 transition-colors">
                     <ChevronRight className="w-3 h-3" />
                  </button>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={() => setHasIntegrations(!hasIntegrations)}
                className="hidden md:flex items-center gap-1 px-2 py-1 text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800"
                title="Toggle Integration State (Demo)"
             >
                <Plug className="w-3 h-3" />
                {hasIntegrations ? 'Linked' : 'Unlinked'}
             </button>

             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             
             <button 
                className="lg:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                onClick={() => setShowMobileContext(!showMobileContext)}
             >
                <Menu className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-900"></span>
             </button>

             <button 
               onClick={handleSave}
               disabled={saveStatus === 'saving'}
               className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95
                  ${saveStatus === 'saved' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
               `}
             >
               {saveStatus === 'saving' ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span>Saving...</span>
                 </>
               ) : saveStatus === 'saved' ? (
                 <>
                   <Check className="w-4 h-4" />
                   <span>Saved!</span>
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4" />
                   <span>Зберегти та відправити</span>
                 </>
               )}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           <div className="lg:col-span-8 space-y-8">
              <YesterdayCard 
                 tasks={reportState.yesterday.plannedTasks}
                 unplannedWork={reportState.yesterday.unplannedWork}
                 smallTasks={reportState.yesterday.smallTasks}
                 summary={reportState.yesterday.summary}
                 metrics={reportState.yesterday.metrics}
                 onTaskStatusChange={handleTaskStatusChange}
                 onTaskCommentChange={handleTaskCommentChange}
                 onUnplannedChange={(v) => updateYesterdayField('unplannedWork', v)}
                 onSmallTasksChange={(v) => updateYesterdayField('smallTasks', v)}
                 onSummaryChange={(v) => updateYesterdayField('summary', v)}
                 onMetricsChange={(v) => updateYesterdayField('metrics', v)}
              />

              <TodayCard 
                 {...reportState.today}
                 onChange={updateTodayField}
              />

              <HelpCard 
                 blockers={reportState.help.blockers}
                 onChange={updateHelpField}
              />

              <div className="sm:hidden sticky bottom-4 z-20">
                  <button 
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-colors
                      ${saveStatus === 'saved' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white'}
                    `}
                  >
                    {saveStatus === 'saving' ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                    ) : saveStatus === 'saved' ? (
                       <Check className="w-5 h-5" />
                    ) : (
                       <Save className="w-5 h-5" />
                    )}
                    <span>{saveStatus === 'saved' ? 'Збережено' : 'Зберегти та відправити'}</span>
                  </button>
              </div>
           </div>

           <div className={`
              lg:col-span-4 lg:block
              ${showMobileContext ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4 overflow-y-auto' : 'hidden'}
           `}>
              {showMobileContext && (
                 <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h2 className="text-xl font-bold dark:text-white">Контекст</h2>
                    <button onClick={() => setShowMobileContext(false)} className="text-slate-500">
                       <ChevronRight className="w-6 h-6" />
                    </button>
                 </div>
              )}
              
              <ContextPanel 
                 isMobile={showMobileContext} 
                 hasIntegrations={hasIntegrations}
                 onConnect={() => setHasIntegrations(true)}
                 todayBigTask={reportState.today.bigTask}
                 todayBigTaskTime={reportState.today.bigTaskTime}
                 isBigTaskBooked={reportState.today.isBigTaskBooked}
              />
           </div>

        </div>
      </main>
    </div>
  );
}

export default App;
