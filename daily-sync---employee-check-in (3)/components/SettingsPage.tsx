
import React, { useState } from 'react';
import { User, Bell, Clock, Save, Mail, Shield, Check } from 'lucide-react';

export const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Mock User Data
  const [formData, setFormData] = useState({
    firstName: 'Олексій',
    lastName: 'Ковальчук',
    role: 'Frontend Lead',
    email: 'alex.k@company.com',
    bio: 'Building awesome UIs',
    workStart: '09:00',
    workEnd: '18:00',
    notifications: {
      emailDigest: true,
      slackAlerts: true,
      browserPush: false
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 800);
  };

  const toggleNotify = (key: keyof typeof formData.notifications) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Налаштування профілю</h1>
        <p className="text-slate-500 dark:text-slate-400">Керуйте своєю особистою інформацією та вподобаннями.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Visual only for now) */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium">
            <User className="w-4 h-4" /> Профіль
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
            <Bell className="w-4 h-4" /> Сповіщення
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
            <Clock className="w-4 h-4" /> Робочий графік
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors">
            <Shield className="w-4 h-4" /> Безпека
          </button>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            
            {/* Section: Public Profile */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" /> Публічна інформація
              </h3>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="relative group cursor-pointer">
                  <img 
                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-slate-700"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium">Change</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ім'я</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Прізвище</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Посада</label>
                    <input 
                      type="text" 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Working Hours */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" /> Робочі години
              </h3>
              <p className="text-sm text-slate-500 mb-4">Цей час використовується для відображення вашого таймлайну.</p>
              
              <div className="flex items-center gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Початок</label>
                    <input 
                      type="time" 
                      value={formData.workStart}
                      onChange={(e) => setFormData({...formData, workStart: e.target.value})}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
                    />
                 </div>
                 <div className="h-px w-4 bg-slate-300 dark:bg-slate-600 mt-5"></div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Кінець</label>
                    <input 
                      type="time" 
                      value={formData.workEnd}
                      onChange={(e) => setFormData({...formData, workEnd: e.target.value})}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white"
                    />
                 </div>
              </div>
            </div>

            {/* Section: Notifications */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-400" /> Сповіщення
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-sm font-medium text-slate-900 dark:text-white">Email Дайджест</p>
                       <p className="text-xs text-slate-500">Отримувати підсумки тижня на пошту.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleNotify('emailDigest')}
                      className={`w-11 h-6 rounded-full transition-colors relative ${formData.notifications.emailDigest ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.notifications.emailDigest ? 'translate-x-5' : ''}`}></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-sm font-medium text-slate-900 dark:text-white">Slack Нагадування</p>
                       <p className="text-xs text-slate-500">Нагадувати про звіт о 10:00.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleNotify('slackAlerts')}
                      className={`w-11 h-6 rounded-full transition-colors relative ${formData.notifications.slackAlerts ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.notifications.slackAlerts ? 'translate-x-5' : ''}`}></div>
                    </button>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end">
               <button 
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-all
                     ${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                  `}
               >
                  {isSaved ? (
                     <>
                       <Check className="w-4 h-4" /> Збережено
                     </>
                  ) : (
                     <>
                       <Save className="w-4 h-4" /> Зберегти зміни
                     </>
                  )}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
