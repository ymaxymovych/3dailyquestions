
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { MyReportPage } from './components/MyReportPage';
import { TeamDashboard } from './components/TeamDashboard';
import { SettingsPage } from './components/SettingsPage';

function App() {
  const [activePage, setActivePage] = useState<'my-report' | 'dashboard' | 'settings'>('my-report');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const renderContent = () => {
    switch (activePage) {
      case 'my-report':
        return <MyReportPage />;
      case 'dashboard':
        return <TeamDashboard />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MyReportPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex">
      
      {/* Sidebar for Desktop */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Top Mobile/Tablet Header (Only visible on small screens when sidebar is hidden) */}
         <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                     <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                 </button>
                 <span className="font-bold text-lg text-slate-900 dark:text-white">DailySync</span>
             </div>
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
         </div>

         {/* Mobile Sidebar Overlay */}
         {isSidebarOpen && (
             <div className="fixed inset-0 z-50 lg:hidden flex">
                 <div className="w-64 h-full bg-slate-900 relative z-50">
                     <Sidebar activePage={activePage} onNavigate={(page) => {
                         setActivePage(page);
                         setIsSidebarOpen(false);
                     }} />
                 </div>
                 <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
             </div>
         )}
         
         {/* Theme Toggle for Desktop (Absolute positioning top right) */}
         <div className="hidden lg:block absolute top-4 right-6 z-20">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 shadow-sm transition-all"
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
         </div>

         {/* Page Content */}
         <div className="flex-1 overflow-x-hidden">
             {renderContent()}
         </div>
      </div>
    </div>
  );
}

export default App;
