'use client';

import { useMemo } from 'react';
import { format, differenceInMinutes, startOfDay, addHours, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export interface TimelineTask {
    id: string;
    title: string;
    type: 'BIG' | 'MEDIUM' | 'SMALL';
    plannedStart: string | Date; // ISO string or Date
    plannedEnd: string | Date;
}

interface TimelineProps {
    date: Date;
    tasks: TimelineTask[];
    className?: string;
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 7; // Start view at 7:00
const END_HOUR = 22; // End view at 22:00

const Timeline = ({ date, tasks, className }: TimelineProps) => {
    const hours = useMemo(() => {
        const result = [];
        for (let i = START_HOUR; i <= END_HOUR; i++) {
            result.push(i);
        }
        return result;
    }, []);

    const getPositionStyle = (start: Date, end: Date) => {
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();

        // Offset from START_HOUR
        const top = (startMinutes - START_HOUR * 60) * (HOUR_HEIGHT / 60);
        const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60);

        return {
            top: `${Math.max(0, top)}px`,
            height: `${Math.max(20, height)}px`, // Min height 20px
        };
    };

    const visibleTasks = useMemo(() => {
        return tasks.filter(task => {
            if (!task.plannedStart || !task.plannedEnd) return false;
            const start = new Date(task.plannedStart);
            // Filter out tasks not on this day (simplified)
            // In real app, we'd check full date equality
            return start.getHours() >= START_HOUR && start.getHours() < END_HOUR;
        });
    }, [tasks]);

    return (
        <div className={cn("flex h-full overflow-y-auto bg-white", className)}>
            {/* Time Labels */}
            <div className="w-14 flex-shrink-0 border-r bg-gray-50/50">
                <div className="relative" style={{ height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT }}>
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="absolute w-full text-right pr-2 text-xs text-muted-foreground -mt-2"
                            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                        >
                            {hour}:00
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 relative min-w-[200px]">
                <div className="relative" style={{ height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT }}>

                    {/* Hour Lines */}
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="absolute w-full border-t border-gray-100"
                            style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
                        />
                    ))}

                    {/* Work Window Background */}
                    <div
                        className="absolute w-full bg-blue-50/30 pointer-events-none"
                        style={{
                            top: (WORK_START_HOUR - START_HOUR) * HOUR_HEIGHT,
                            height: (WORK_END_HOUR - WORK_START_HOUR) * HOUR_HEIGHT,
                        }}
                    />

                    {/* Lunch Placeholder (13:00-14:00) */}
                    <div
                        className="absolute w-full bg-gray-100/50 flex items-center justify-center text-xs text-muted-foreground border-y border-dashed border-gray-200"
                        style={{
                            top: (13 - START_HOUR) * HOUR_HEIGHT,
                            height: 1 * HOUR_HEIGHT,
                        }}
                    >
                        Обід ☕
                    </div>

                    {/* Tasks */}
                    {visibleTasks.map((task) => {
                        const start = new Date(task.plannedStart);
                        const end = new Date(task.plannedEnd);
                        const style = getPositionStyle(start, end);

                        return (
                            <div
                                key={task.id}
                                className={cn(
                                    "absolute left-2 right-2 rounded-md border px-2 py-1 text-xs shadow-sm overflow-hidden transition-all hover:z-10 hover:shadow-md cursor-pointer",
                                    task.type === 'BIG' ? "bg-blue-100 border-blue-200 text-blue-800" :
                                        task.type === 'MEDIUM' ? "bg-purple-100 border-purple-200 text-purple-800" :
                                            "bg-gray-100 border-gray-200 text-gray-800"
                                )}
                                style={style}
                                title={`${task.title} (${format(start, 'HH:mm')} - ${format(end, 'HH:mm')})`}
                            >
                                <div className="font-semibold truncate">{format(start, 'HH:mm')} - {task.title}</div>
                            </div>
                        );
                    })}

                    {/* Current Time Line (if today) */}
                    {/* TODO: Add current time indicator */}

                </div>
            </div>
        </div>
    );
};

export default Timeline;
