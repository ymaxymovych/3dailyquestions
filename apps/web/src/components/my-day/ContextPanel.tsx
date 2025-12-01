import React, { useState } from 'react';
import { Calendar, Briefcase, ExternalLink, Plug, HardDrive, Github, LayoutList, ChevronDown, ChevronRight, GripVertical, Plus, Copy, Check } from 'lucide-react';
import { TODAY_EVENTS, MOCK_ARTIFACTS } from './constants';
import { Artifact, CalendarEvent } from './types';

interface ContextPanelProps {
    isMobile?: boolean;
    hasIntegrations?: boolean;
    onConnect?: () => void;
    // New props for dynamic timeline
    todayBigTask?: string;
    todayBigTaskTime?: string;
    isBigTaskBooked?: boolean;
}

const ArtifactCard = ({ artifact }: { artifact: Artifact }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${artifact.title} (${artifact.subtitle})`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', `${artifact.title} (${artifact.subtitle})`);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable="true"
            onDragStart={handleDragStart}
            className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 cursor-grab active:cursor-grabbing transition-all pr-8"
        >
            <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300">
                <GripVertical className="w-3 h-3" />
            </div>

            <button
                onClick={handleCopy}
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-all"
                title="Copy to clipboard"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <div className="pl-3">
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight mb-1">
                    {artifact.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {artifact.subtitle}
                </p>
            </div>
        </div>
    );
};

const IntegrationSection = ({
    title,
    icon: Icon,
    artifacts,
    hasIntegration,
    onConnect
}: {
    title: string;
    icon: React.ElementType;
    artifacts: Artifact[];
    hasIntegration: boolean;
    onConnect: () => void;
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const visibleArtifacts = showAll ? artifacts : artifacts.slice(0, 2);
    const hasHiddenItems = artifacts.length > 2;

    if (!hasIntegration) {
        return (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between group transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{title}</span>
                </div>
                <button
                    onClick={onConnect}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm transition-all active:scale-95"
                >
                    <Plus className="w-3 h-3" />
                    Connect
                </button>
            </div>
        )
    }

    return (
        <div className="border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-colors">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-2 group"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" />
                    <span className="font-bold text-base text-slate-800 dark:text-slate-200">{title}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {isExpanded && (
                <div className="space-y-2 mb-2 animate-in slide-in-from-top-2 duration-200">
                    {visibleArtifacts.map((artifact) => (
                        <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}

                    {hasHiddenItems && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ml-1 py-1 transition-colors"
                        >
                            <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                            {showAll ? 'LESS' : 'MORE'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export const ContextPanel: React.FC<ContextPanelProps> = ({
    isMobile,
    hasIntegrations = true,
    onConnect,
    todayBigTask,
    todayBigTaskTime,
    isBigTaskBooked
}) => {
    const [activeTab, setActiveTab] = useState<'sources' | 'timeline'>('sources');

    const [connectedTools, setConnectedTools] = useState({
        Calendar: true,
        Drive: true,
        GitHub: true,
        Asana: false
    });

    const toggleConnection = (tool: keyof typeof connectedTools) => {
        setConnectedTools(prev => ({
            ...prev,
            [tool]: !prev[tool]
        }));
    };

    // Helper to construct the timeline events list with the dynamic "Booked Task"
    const getTimelineEvents = () => {
        let events = [...TODAY_EVENTS];

        if (isBigTaskBooked && todayBigTaskTime) {
            // Simple parser for "10:00" or "10:00-12:00"
            // In a real app, use date-fns. Here we just grab the first time string.
            const startTimeMatch = todayBigTaskTime.match(/(\d{1,2}:\d{2})/);
            const startTime = startTimeMatch ? startTimeMatch[0] : "??:??";

            // Rough estimate for duration
            const duration = 120; // Default 2h if not parsed

            const focusEvent: CalendarEvent = {
                id: 'booked-focus-task',
                title: todayBigTask || 'Focus Task',
                time: startTime,
                durationMinutes: duration,
                type: 'focus'
            };
            events.push(focusEvent);
        }

        // Sort by time (simple string sort works for HH:MM format in this mock)
        return events.sort((a, b) => a.time.localeCompare(b.time));
    };

    const timelineEvents = getTimelineEvents();

    if (!hasIntegrations) {
        return (
            <div className={`flex flex-col h-full ${isMobile ? 'w-full mt-8' : 'w-full sticky top-6'}`}>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex mb-4 opacity-50 pointer-events-none">
                    <span className="flex-1 text-center py-1.5 text-sm font-medium text-slate-500">Вчора</span>
                    <span className="flex-1 text-center py-1.5 text-sm font-medium text-slate-500">Сьогодні</span>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
                        <Plug className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Дані недоступні</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
                        Підключіть інтеграції, щоб бачити події календаря та активність в Jira/Drive.
                    </p>
                    <button
                        onClick={onConnect}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                    >
                        Підключити інтеграції
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full ${isMobile ? 'w-full mt-8' : 'w-full sticky top-6'}`}>

            {/* Tabs */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex mb-4">
                <button
                    onClick={() => setActiveTab('sources')}
                    className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-all ${activeTab === 'sources'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    Sources (Вчора)
                </button>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-all ${activeTab === 'timeline'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    Timeline
                </button>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">

                {activeTab === 'sources' ? (
                    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
                        <IntegrationSection
                            title="Calendar"
                            icon={Calendar}
                            artifacts={MOCK_ARTIFACTS.Calendar}
                            hasIntegration={connectedTools.Calendar}
                            onConnect={() => toggleConnection('Calendar')}
                        />
                        <div className="h-px bg-slate-100 dark:bg-slate-700" />

                        <IntegrationSection
                            title="Drive"
                            icon={HardDrive}
                            artifacts={MOCK_ARTIFACTS.Drive}
                            hasIntegration={connectedTools.Drive}
                            onConnect={() => toggleConnection('Drive')}
                        />
                        <div className="h-px bg-slate-100 dark:bg-slate-700" />

                        <IntegrationSection
                            title="GitHub"
                            icon={Github}
                            artifacts={MOCK_ARTIFACTS.GitHub}
                            hasIntegration={connectedTools.GitHub}
                            onConnect={() => toggleConnection('GitHub')}
                        />
                        <div className="h-px bg-slate-100 dark:bg-slate-700" />

                        <IntegrationSection
                            title="Asana"
                            icon={LayoutList}
                            artifacts={MOCK_ARTIFACTS.Asana}
                            hasIntegration={connectedTools.Asana}
                            onConnect={() => toggleConnection('Asana')}
                        />
                    </div>
                ) : (
                    <div className="p-4 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="mb-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold uppercase text-green-700 dark:text-green-400">Balanced</span>
                                <Briefcase className="w-3 h-3 text-green-600" />
                            </div>
                            <p className="text-xs text-green-800 dark:text-green-300">
                                План: 6.5 год фокусу при доступних 7 год.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-6 py-2">
                                {timelineEvents.map((event) => (
                                    <div key={event.id} className="relative pl-6 animate-in slide-in-from-left-2 duration-300">
                                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800
                                ${event.type === 'meeting' ? 'bg-slate-400' :
                                                event.type === 'focus' ? 'bg-purple-500' : 'bg-green-400'}
                            `} />

                                        <div className={`text-xs font-bold mb-0.5 ${event.type === 'focus' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}>
                                            {event.time} <span className="font-normal opacity-70">({event.durationMinutes}m)</span>
                                        </div>

                                        <div className={`p-2 rounded-md text-sm border 
                                ${event.type === 'focus'
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-900 dark:text-purple-100'
                                                : event.type === 'break'
                                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-200'
                                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm'}
                            `}>
                                            {event.title}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Manage Integrations
                    </button>
                </div>
            </div>
        </div>
    );
};
