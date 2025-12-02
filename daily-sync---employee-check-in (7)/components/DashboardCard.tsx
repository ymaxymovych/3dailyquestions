
import React, { useState } from 'react';
import { Flame, BarChart2, AlertTriangle, ThumbsUp, AlertCircle, CheckCircle2, Circle, ArrowRight, Mail, FileText, Activity, Calendar, ChevronDown, ChevronUp, Clock, Handshake } from 'lucide-react';
import { DayReportSummary, TaskStatus, SignalItem } from '../types';

interface DashboardCardProps {
  report: DayReportSummary;
  onLike: () => void;
  isLiked: boolean;
  onHelpOffer: () => void;
  hasHelpOffer: boolean;
}

// Helper component for lists that can expand
const ExpandableActivityList = ({ 
  title, 
  icon: Icon, 
  items 
}: { 
  title: string, 
  icon: React.ElementType, 
  items: SignalItem[] 
}) => {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 3);
  const hiddenCount = items.length - 3;

  return (
    <div>
        <div className="text-[9px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1">
            <Icon className="w-2.5 h-2.5" /> {title}
        </div>
        <div className="space-y-1">
            {visibleItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-2 text-[10px] text-slate-600 dark:text-slate-300 group">
                    <span className="truncate flex-1 font-medium" title={item.title}>{item.title}</span>
                    <span className="text-slate-400 font-mono shrink-0 text-[9px] whitespace-nowrap">{item.time}</span>
                </div>
            ))}
            
            {!showAll && hiddenCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
                className="text-[10px] text-blue-500 font-medium hover:text-blue-600 flex items-center gap-0.5 mt-1 hover:underline decoration-blue-500/30"
              >
                 Show {hiddenCount} more...
              </button>
            )}
            
            {showAll && items.length > 3 && (
               <button 
                onClick={(e) => { e.stopPropagation(); setShowAll(false); }}
                className="text-[10px] text-slate-400 hover:text-slate-500 mt-1 hover:underline"
              >
                 Show less
              </button>
            )}
        </div>
    </div>
  );
};

export const DashboardCard: React.FC<DashboardCardProps> = ({ report, onLike, isLiked, onHelpOffer, hasHelpOffer }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTasksExpanded, setIsTasksExpanded] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const toggleComment = (taskId: string) => {
    const newSet = new Set(expandedComments);
    if (newSet.has(taskId)) {
        newSet.delete(taskId);
    } else {
        newSet.add(taskId);
    }
    setExpandedComments(newSet);
  };

  if (report.isMissing) {
    return (
      <div className="h-full min-h-[140px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 opacity-60 group hover:opacity-100 transition-opacity bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-slate-400" />
        </div>
        <span className="text-xs text-slate-400 font-medium text-center">No Report</span>
        <button className="text-[10px] font-bold text-blue-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Nudge
        </button>
      </div>
    );
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'border-green-400 bg-green-50 dark:bg-green-900/10';
      case 'partial': return 'border-amber-400 bg-amber-50 dark:bg-amber-900/10';
      case 'moved': return 'border-slate-300 bg-slate-50 dark:bg-slate-800/50';
      default: return 'border-slate-200';
    }
  };

  const getTaskStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case 'done': return <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />;
        case 'partial': return <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
        case 'moved': return <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const ReportContent = () => (
    <div className="flex flex-col gap-4 h-full">
        {/* 1. Blockers (Top Priority) - Cleaner Design */}
        {report.blockers && (
            <div className="bg-red-50/50 dark:bg-red-900/10 p-2.5 rounded-lg text-red-900 dark:text-red-100 text-xs relative overflow-hidden group/blocker">
                {/* Subtle visual accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-400/50 rounded-l-lg"></div>
                
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-red-600 dark:text-red-400 mb-1">
                    <AlertTriangle className="w-3 h-3" /> Blockers
                </div>
                <p className="whitespace-pre-line leading-relaxed font-medium pl-1">{report.blockers}</p>
            </div>
        )}

        {/* 2. Big Task - Cleaned up (No border/bg) */}
        <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-purple-500" />
                Big Task
            </div>
            {/* Removed bg-white, border, p-2 to reduce visual noise */}
            <div className="flex items-start gap-2 pl-1">
                 <div className="mt-0.5">
                    {getTaskStatusIcon(report.bigTaskStatus)}
                 </div>
                 <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {report.bigTask}
                    {report.bigTaskTime && (
                        <span className="text-slate-400 font-normal whitespace-nowrap ml-1.5 text-xs inline-flex items-center gap-0.5">
                            <Clock className="w-3 h-3 opacity-70" /> {report.bigTaskTime}
                        </span>
                    )}
                </h4>
            </div>
        </div>

        {/* 3. Medium Tasks (Expandable) */}
        {report.mediumTasks && report.mediumTasks.length > 0 && (
            <div>
                <button 
                    onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                    className="w-full flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <span>Tasks ({report.mediumTasks.length})</span>
                    {isTasksExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                
                {isTasksExpanded && (
                    <ul className="space-y-1.5">
                        {report.mediumTasks.map((task) => (
                            <li 
                                key={task.id} 
                                className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer group"
                                onClick={() => toggleComment(task.id)}
                            >
                                <div className="flex items-start gap-2 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors">
                                    <div className="mt-0.5 shrink-0">{getTaskStatusIcon(task.status)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-baseline gap-1">
                                            <span className={`font-medium ${task.status === 'moved' ? 'opacity-60 decoration-slate-400' : ''}`}>
                                                {task.title}
                                            </span>
                                            {task.timeEstimate && (
                                                <span className="text-slate-400 text-[10px] font-mono whitespace-nowrap">
                                                    ({task.timeEstimate})
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Comment: Show if expanded OR if user explicitly clicked */}
                                        {(expandedComments.has(task.id) || task.comment) && (
                                            <div className={`text-[10px] mt-1 italic pl-1 border-l-2 border-slate-200 dark:border-slate-700
                                                ${expandedComments.has(task.id) ? 'text-slate-500' : 'text-slate-400 truncate group-hover:whitespace-normal group-hover:text-slate-500'}
                                            `}>
                                                {task.comment || "No comment"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}

        {/* 4. Small Tasks */}
        {report.smallTasks && (
            <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Small Fixes</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed pl-2 border-l border-slate-200 dark:border-slate-700">
                    {report.smallTasks}
                </p>
            </div>
        )}

        {/* 5. Unplanned Work */}
        {report.unplannedWork && (
            <div className="mt-auto pt-2">
                 <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded text-amber-900 dark:text-amber-100 border border-amber-100 dark:border-amber-900/30 text-xs">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-amber-600 dark:text-amber-400 mb-1">
                        <Flame className="w-3 h-3" /> Unplanned / Fire
                    </div>
                    <p className={`whitespace-pre-line leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{report.unplannedWork}</p>
                </div>
            </div>
        )}

        {/* 6. Metrics */}
        {report.metrics && (
             <div className="mt-2 bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-900/30 text-xs font-mono">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-blue-600 dark:text-blue-400 mb-0.5 font-sans">
                   <BarChart2 className="w-3 h-3" /> Outcomes
               </div>
               <p className={`whitespace-pre-line ${!isExpanded ? 'line-clamp-2' : ''}`}>{report.metrics}</p>
           </div>
        )}
    </div>
  );

  const ActivityFooter = () => {
      if (!report.activity) return null;

      return (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
            {report.activity.sourceType === 'tracker' ? (
                // TRACKER VIEW
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Tracker Data
                            </div>
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                <span className="text-indigo-600 dark:text-indigo-400">{report.activity.focusTime}</span> Focus 
                                <span className="text-slate-300 mx-1">/</span> 
                                {report.activity.totalTime} Total
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {report.activity.focusPercentage}% Focus
                        </div>
                    </div>
                    {/* Top Apps */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                        {report.activity.topApps?.slice(0, 3).map((app, i) => (
                            <div key={i} className="flex justify-between items-center px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 text-[10px]">
                                <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{app.name}</span>
                                <span className="text-slate-400 font-mono">{app.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // SIGNALS VIEW (Detailed Lists)
                <div>
                    <div className="flex justify-between items-start mb-3">
                         <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Activity Signals
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.activity.workStart} - {report.activity.workEnd}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Recent Emails */}
                        {report.activity.recentEmails && report.activity.recentEmails.length > 0 && (
                           <ExpandableActivityList title="Recent Emails" icon={Mail} items={report.activity.recentEmails} />
                        )}

                        {/* Recent Docs */}
                        {report.activity.recentDocs && report.activity.recentDocs.length > 0 && (
                            <ExpandableActivityList title="Edited Documents" icon={FileText} items={report.activity.recentDocs} />
                        )}
                        
                         {/* Recent Meetings */}
                         {report.activity.recentMeetings && report.activity.recentMeetings.length > 0 && (
                            <ExpandableActivityList title="Calendar Meetings" icon={Calendar} items={report.activity.recentMeetings} />
                        )}
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className={`
      relative rounded-xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-800 border-l-[3px] border-y border-r border-slate-200 dark:border-slate-700 flex flex-col group
      ${getStatusColor(report.bigTaskStatus)}
      h-auto
    `}>
      <div className="p-4 flex-1 flex flex-col">
         <ReportContent />
         {isExpanded && <ActivityFooter />}
      </div>
      
      {/* Redesigned Footer: Expander + Actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700 rounded-b-xl">
          <div className="flex-1"></div> {/* Spacer for alignment */}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? "Collapse activity" : "Expand to see activity signals"}
          >
            {isExpanded ? (
               <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
               <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="flex-1 flex justify-end items-center gap-2">
                {/* Help Button - Contextual */}
                {report.blockers && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onHelpOffer(); }}
                        className={`p-1.5 rounded-full transition-all flex items-center gap-1.5 ${hasHelpOffer ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10'}`}
                        title="Offer help to this teammate"
                    >
                        <Handshake className="w-4 h-4" />
                        {hasHelpOffer && <span className="text-[10px] font-bold">Helped</span>}
                    </button>
                )}

                {/* Like Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onLike(); }}
                    className={`p-1.5 rounded-full transition-all flex items-center gap-1.5 ${isLiked ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}
                    title="Acknowledge report"
                >
                    <ThumbsUp className="w-4 h-4" />
                    {isLiked && <span className="text-[10px] font-bold">1</span>}
                </button>
          </div>
      </div>
    </div>
  );
};
