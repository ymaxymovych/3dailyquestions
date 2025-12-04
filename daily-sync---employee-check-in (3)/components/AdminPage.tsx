
import React, { useState } from 'react';
import { Building, Layers, Briefcase, Plus, Users, Globe, Clock, ChevronRight, Award, Trash2, Edit2, Info } from 'lucide-react';

// --- Types for Admin State ---

interface Department {
  id: string;
  name: string;
  head: string;
  description: string;
  teamsCount: number;
}

interface Role {
  id: string;
  title: string;
  department: string;
  level: 'Junior' | 'Middle' | 'Senior' | 'Lead';
  archetype?: string;
}

// --- Mock Data ---

const MOCK_DEPTS: Department[] = [
  { id: 'd1', name: 'Engineering', head: 'Олексій (You)', description: 'Розробка продукту та підтримка інфраструктури', teamsCount: 3 },
  { id: 'd2', name: 'Sales', head: 'Дмитро', description: 'Продажі Enterprise клієнтам та SMB', teamsCount: 2 },
  { id: 'd3', name: 'Marketing', head: 'Анна', description: 'Бренд, лідогенерація та контент', teamsCount: 1 },
];

const MOCK_ROLES: Role[] = [
  { id: 'r1', title: 'Frontend Developer', department: 'Engineering', level: 'Middle', archetype: 'Software Engineer' },
  { id: 'r2', title: 'Sales Manager', department: 'Sales', level: 'Senior', archetype: 'Sales Representative' },
  { id: 'r3', title: 'Product Designer', department: 'Design', level: 'Middle', archetype: 'Designer' },
];

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'structure' | 'roles'>('general');
  const [departments, setDepartments] = useState(MOCK_DEPTS);
  const [roles, setRoles] = useState(MOCK_ROLES);

  // --- Sub-components ---

  const GeneralSettings = () => (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" /> Основні налаштування
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Назва компанії</label>
              <input type="text" defaultValue="TechCorp Solutions" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Таймзона</label>
              <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                 <option>Kyiv (GMT+2)</option>
                 <option>London (GMT+0)</option>
                 <option>New York (GMT-5)</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Мова інтерфейсу</label>
              <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                 <option>Українська</option>
                 <option>English</option>
              </select>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" /> Робочий графік
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ці налаштування допомагають AI розуміти, коли очікувати активності від команди.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Тип роботи</label>
              <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                 <option>Hybrid (Office + Remote)</option>
                 <option>Fully Remote</option>
                 <option>Office Only</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Старт дня</label>
              <input type="time" defaultValue="09:00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Кінець дня</label>
              <input type="time" defaultValue="18:00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
           </div>
        </div>
      </div>
    </div>
  );

  const StructureSettings = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
         <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Департаменти</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Основні функціональні одиниці компанії.</p>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Додати департамент
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
         {departments.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group cursor-pointer">
               <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                     <Layers className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
               <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{dept.name}</h4>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-10">{dept.description}</p>
               
               <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                     <Users className="w-3.5 h-3.5" />
                     {dept.teamsCount} Команди
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                     <span className="font-normal">Head:</span> {dept.head}
                  </div>
               </div>
            </div>
         ))}
         
         {/* Add New Placeholder */}
         <button className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Plus className="w-5 h-5" />
             </div>
             <span className="font-medium text-sm">Створити новий</span>
         </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg p-4 flex items-start gap-3">
         <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
         <div>
            <h5 className="text-sm font-bold text-amber-800 dark:text-amber-200">Орг-схема (AI Context)</h5>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
               Правильно налаштована структура дозволяє AI розуміти, хто за що відповідає, і будувати коректні ланцюжки ескалації в дайджестах для керівників.
            </p>
         </div>
      </div>
    </div>
  );

  const RolesSettings = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="flex justify-between items-center">
         <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ролі та Архетипи</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Опис очікувань від кожної позиції для AI-ментора.</p>
         </div>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
               Бібліотека архетипів
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
               <Plus className="w-4 h-4" /> Додати роль
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
               <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Назва ролі</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Департамент</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Рівень</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Архетип</th>
                  <th className="px-6 py-4 text-right">Дії</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {roles.map(role => (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                     <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{role.title}</td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium">
                           {role.department}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{role.level}</td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-xs">
                           <Award className="w-3.5 h-3.5" />
                           {role.archetype || 'Не призначено'}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                           <Edit2 className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         {roles.length === 0 && (
            <div className="p-8 text-center text-slate-500">
               Ролі ще не додані.
            </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Компанія</h1>
        <p className="text-slate-500 dark:text-slate-400">Налаштування структури та контексту для AI Advisory Board.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
         <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
               activeTab === 'general' 
               ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
               : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
         >
            <Building className="w-4 h-4" /> Налаштування
         </button>
         <button 
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
               activeTab === 'structure' 
               ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
               : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
         >
            <Layers className="w-4 h-4" /> Структура
         </button>
         <button 
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
               activeTab === 'roles' 
               ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
               : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
         >
            <Briefcase className="w-4 h-4" /> Ролі
         </button>
      </div>

      {/* Content Area */}
      <div>
         {activeTab === 'general' && <GeneralSettings />}
         {activeTab === 'structure' && <StructureSettings />}
         {activeTab === 'roles' && <RolesSettings />}
      </div>
    </div>
  );
};
