import React from 'react';
import { Plus, Zap, CheckSquare, BarChart2, ChevronDown } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface YesterdayCardProps {
  tasks: Task[];
  unplannedWork: string;
  smallTasks: string;
  summary: string;
  metrics: string;
  onTaskStatusChange: (id: string, status: TaskStatus) => void;
  onTaskCommentChange: (id: string, comment: string) => void; // New handler
  onUnplannedChange: (val: string) => void;
  onSmallTasksChange: (val: string) => void;
  onSummaryChange: (val: string) => void;
  onMetricsChange: (val: string) => void;
}

export const YesterdayCard: React.FC<YesterdayCardProps> = ({
  tasks, unplannedWork, smallTasks, summary, metrics, 
  onTaskStatusChange, onTaskCommentChange, 
  onUnplannedChange, onSmallTasksChange, onSummaryChange, onMetricsChange
}) => {
  
  const handleStatusCycle = (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'done': 'partial',
      'partial': 'moved',
      'moved': 'done'
    };
    onTaskStatusChange(task.id, nextStatus[task.status]);
  };

  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50';
      case 'partial':
        return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50';
      case 'moved':
        return 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'Зроблено';
      case 'partial': return 'Частково';
      case 'moved': return 'Перенесено';
    }
  };

  const handleDrop = (e: React.DragEvent, currentVal: string, onChangeFn: (val: string) => void) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      const newValue = currentVal ? `${currentVal}\n${droppedText}` : droppedText;
      onChangeFn(newValue);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Що я зробив учора
        </h2>
      </div>

      <div className="p-5 space-y-6">
        {/* Section A: Planned Tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Заплановані задачі</h3>
             <button className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                <Plus className="w-3 h-3" />
                Add Missing Task
             </button>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="group p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase 
                        ${task.type === 'Big' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                        {task.type}
                      </span>
                      {task.timeEstimate && (
                        <span className="text-xs text-slate-400">({task.timeEstimate})</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Toggle Button */}
                  <button 
                    onClick={() => handleStatusCycle(task)}
                    className={`
                      self-start sm:self-auto text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all select-none flex items-center gap-1.5 whitespace-nowrap
                      ${getStatusStyles(task.status)}
                    `}
                    title="Click to change status"
                  >
                    <span>{getStatusLabel(task.status)}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                </div>

                {/* Inline Comment Input - Always available but subtle */}
                <input 
                  type="text"
                  value={task.comment || ''}
                  onChange={(e) => onTaskCommentChange(task.id, e.target.value)}
                  placeholder={task.status === 'done' ? "Додати коментар (опціонально)..." : "Чому не зроблено? / Що залишилось?..."}
                  className="w-full bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 py-1 text-xs text-slate-600 dark:text-slate-400 placeholder:text-slate-400 focus:border-blue-400 focus:text-slate-800 dark:focus:text-slate-200 outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section B & C: Unplanned & Small Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <div className="flex items-center gap-2 mb-2">
                 <Zap className="w-3 h-3 text-amber-500" />
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Незаплановане / Аврали</h3>
              </div>
              <div className="relative h-full">
                 <textarea
                  value={unplannedWork}
                  onChange={(e) => onUnplannedChange(e.target.value)}
                  onDrop={(e) => handleDrop(e, unplannedWork, onUnplannedChange)}
                  onDragOver={handleDragOver}
                  className="w-full h-28 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all outline-none resize-y"
                  placeholder="Що прилетіло раптово?"
                />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2">
                 <CheckSquare className="w-3 h-3 text-slate-400" />
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Дрібні справи (Done)</h3>
              </div>
              <textarea
                value={smallTasks}
                onChange={(e) => onSmallTasksChange(e.target.value)}
                onDrop={(e) => handleDrop(e, smallTasks, onSmallTasksChange)}
                onDragOver={handleDragOver}
                className="w-full h-28 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-y"
                placeholder="Емейли, слак, дрібні фікси..."
              />
            </section>
        </div>

        {/* Section E: Metrics (Text Area) */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-3 h-3 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Метрики за вчора</h3>
          </div>
          <textarea
            value={metrics}
            onChange={(e) => onMetricsChange(e.target.value)}
            onDrop={(e) => handleDrop(e, metrics, onMetricsChange)}
            onDragOver={handleDragOver}
            className="w-full h-24 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-y"
            placeholder="Продажі: 0&#10;Ліди: 0"
          />
        </section>

        {/* Section D: Summary (Compact) */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Загальний коментар (Optional)</h3>
          <input
            type="text"
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            placeholder="В цілому день пройшов..."
          />
        </section>
      </div>
    </div>
  );
};