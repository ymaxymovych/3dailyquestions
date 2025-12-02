import React, { useState } from 'react';
import { Target, ListTodo, MoreHorizontal, BarChart3, HelpCircle, CalendarPlus, CalendarCheck, Sparkles, Loader2 } from 'lucide-react';

interface TodayCardProps {
    bigTask: string;
    bigTaskTime: string;
    isBigTaskBooked: boolean;
    mediumTasks: string;
    smallTasks: string;
    expectedMetrics: string;
    onChange: (field: string, value: string | boolean) => void;
}

export const TodayCard: React.FC<TodayCardProps> = ({
    bigTask, bigTaskTime, isBigTaskBooked, mediumTasks, smallTasks, expectedMetrics, onChange
}) => {

    const [isStructuring, setIsStructuring] = useState(false);

    const handleDrop = (e: React.DragEvent, field: string, currentValue: string) => {
        e.preventDefault();
        const droppedText = e.dataTransfer.getData('text/plain');
        if (droppedText) {
            // For multiline textareas, we append on a new line. For single line inputs, we append with space.
            const separator = (field === 'bigTask' || field === 'bigTaskTime') ? ' ' : '\n';
            // If the field is currently empty, just set the text, otherwise append
            const newValue = currentValue ? `${currentValue}${separator}${droppedText}` : droppedText;
            onChange(field, newValue);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const toggleBooking = () => {
        onChange('isBigTaskBooked', !isBigTaskBooked);
    };

    const handleStructurize = async () => {
        if (!mediumTasks.trim()) return;

        setIsStructuring(true);
        try {
            const response = await fetch('/api/ai/structure-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText: mediumTasks }),
            });

            if (response.ok) {
                const data = await response.json();
                const structured = data.structured;

                // Format structured output
                let formattedText = `${structured.title}\n`;
                if (structured.steps && structured.steps.length > 0) {
                    formattedText += '\nКроки:\n';
                    structured.steps.forEach((step: string, idx: number) => {
                        formattedText += `${idx + 1}. ${step}\n`;
                    });
                }
                if (structured.dod && structured.dod.length > 0) {
                    formattedText += '\nDoD:\n';
                    structured.dod.forEach((item: string) => {
                        formattedText += `✓ ${item}\n`;
                    });
                }
                formattedText += `\nПріоритет: ${structured.priority}`;

                onChange('mediumTasks', formattedText);
            }
        } catch (error) {
            console.error('Failed to structurize task:', error);
        } finally {
            setIsStructuring(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    План на сьогодні
                </h2>

                <div className="group relative">
                    <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                    {/* Tooltip */}
                    <div className="absolute right-0 top-6 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Час вказуйте в дужках, наприклад: (45 хв), або діапазон 10:00-13:00, якщо бажаєте забронювати точний час.
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Section A: Big Task */}
                <section>
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Одна Велика справа</h3>
                    </div>

                    <div className="group relative">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 relative overflow-hidden rounded-lg">
                                {/* Accent border to maintain hierarchy without bold text */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500 z-10"></div>
                                <input
                                    type="text"
                                    value={bigTask}
                                    onChange={(e) => onChange('bigTask', e.target.value)}
                                    onDrop={(e) => handleDrop(e, 'bigTask', bigTask)}
                                    onDragOver={handleDragOver}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-lg pl-5 pr-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Що змінить гру сьогодні?"
                                />
                            </div>

                            <div className="flex relative sm:w-48">
                                <input
                                    type="text"
                                    value={bigTaskTime}
                                    onChange={(e) => onChange('bigTaskTime', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-10 py-3 text-sm text-slate-600 dark:text-slate-400 outline-none focus:border-blue-500 text-center"
                                    placeholder="10:00-13:00"
                                />

                                {/* Booking Button */}
                                <button
                                    onClick={toggleBooking}
                                    title={isBigTaskBooked ? "Час заброньовано в календарі" : "Забронювати час в календарі"}
                                    className={`absolute right-1 top-1 bottom-1 px-2 rounded-md transition-all flex items-center justify-center
                        ${isBigTaskBooked
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                            : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700'}
                    `}
                                >
                                    {isBigTaskBooked ? <CalendarCheck className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section B: Medium Tasks */}
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">3–5 середніх справ</h3>
                        </div>
                        {mediumTasks.trim() && (
                            <button
                                onClick={handleStructurize}
                                disabled={isStructuring}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors disabled:opacity-50"
                                title="AI Structurize - парсить текст в structured task"
                            >
                                {isStructuring ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Structuring...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>AI Structurize</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={mediumTasks}
                        onChange={(e) => onChange('mediumTasks', e.target.value)}
                        onDrop={(e) => handleDrop(e, 'mediumTasks', mediumTasks)}
                        onDragOver={handleDragOver}
                        className="w-full h-32 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y leading-relaxed"
                        placeholder="• Задача 1 (30 хв)..."
                    />
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Section C: Small Tasks */}
                    <section>
                        <div className="flex items-center gap-2 mb-2">
                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Дрібні справи</h3>
                        </div>
                        <textarea
                            value={smallTasks}
                            onChange={(e) => onChange('smallTasks', e.target.value)}
                            onDrop={(e) => handleDrop(e, 'smallTasks', smallTasks)}
                            onDragOver={handleDragOver}
                            className="w-full h-24 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none resize-y"
                            placeholder="Список дрібних справ..."
                        />
                    </section>

                    {/* Section D: Expected Metrics */}
                    <section>
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-green-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Очікувані метрики</h3>
                        </div>
                        <textarea
                            value={expectedMetrics}
                            onChange={(e) => onChange('expectedMetrics', e.target.value)}
                            onDrop={(e) => handleDrop(e, 'expectedMetrics', expectedMetrics)}
                            onDragOver={handleDragOver}
                            className="w-full h-24 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-y font-mono"
                            placeholder="Продажі: 0..."
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};
