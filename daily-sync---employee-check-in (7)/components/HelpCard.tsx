
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface HelpCardProps {
  blockers: string;
  onChange: (val: string) => void;
}

export const HelpCard: React.FC<HelpCardProps> = ({ blockers, onChange }) => {
  
  const handleDrop = (e: React.DragEvent, currentVal: string) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      const newValue = currentVal ? `${currentVal}\n${droppedText}` : droppedText;
      onChange(newValue);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl shadow-sm border border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="p-5 border-b border-amber-100 dark:border-amber-800/50 flex items-center gap-2">
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          Блокери / Потрібна допомога
        </h2>
      </div>

      <div className="p-5">
        <textarea
          value={blockers}
          onChange={(e) => onChange(e.target.value)}
          onDrop={(e) => handleDrop(e, blockers)}
          onDragOver={handleDragOver}
          className="w-full min-h-[100px] bg-white dark:bg-slate-900/50 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-y placeholder:text-amber-900/40 dark:placeholder:text-amber-100/30"
          placeholder="Опишіть, що вас блокує або де потрібна допомога колег..."
        />
      </div>
    </div>
  );
};
