
import React from 'react';
import { LayoutDashboard, FileText, Settings, Users, LogOut, Building2 } from 'lucide-react';

interface SidebarProps {
  activePage: 'my-report' | 'dashboard' | 'settings' | 'admin' | 'landing' | 'pricing';
  onNavigate: (page: 'my-report' | 'dashboard' | 'settings' | 'admin' | 'landing' | 'pricing') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const menuItems = [
    { id: 'my-report', label: 'Мій звіт', icon: FileText },
    { id: 'dashboard', label: 'Команда', icon: LayoutDashboard },
    { id: 'admin', label: 'Компанія', icon: Building2 },
    { id: 'settings', label: 'Налаштування', icon: Settings },
  ] as const;

  return (
    <aside className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg">DailySync</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 group cursor-pointer hover:bg-slate-800 rounded-lg transition-colors">
            <img 
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
                alt="User" 
                className="w-9 h-9 rounded-full border border-slate-600 group-hover:border-slate-500"
            />
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate group-hover:text-blue-200">Олексій</p>
                <p className="text-xs text-slate-500 truncate">Frontend Lead</p>
            </div>
            <button 
              onClick={() => onNavigate('landing')}
              className="text-slate-500 hover:text-white transition-colors p-1"
              title="Log Out"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>
    </aside>
  );
};
