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
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Яка допомога мені потрібна
                </h2>
            </div>

            <div className="p-5">
                <textarea
                    value={blockers}
                    onChange={(e) => onChange(e.target.value)}
                    onDrop={(e) => handleDrop(e, blockers)}
                    onDragOver={handleDragOver}
                    className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-y"
                    placeholder="Мені потрібен доступ до..."
                />
            </div>
        </div>
    );
};
