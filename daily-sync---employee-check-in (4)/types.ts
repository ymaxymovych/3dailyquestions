
export type TaskStatus = 'done' | 'partial' | 'moved';
export type TaskType = 'Big' | 'Medium' | 'Small';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  timeEstimate?: string;
  status: TaskStatus;
  comment?: string;
}

export interface Metric {
  label: string;
  value: string | number;
  source?: 'CRM' | 'Jira' | 'Manual';
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string; // e.g. "10:00"
  durationMinutes: number;
  type: 'meeting' | 'focus' | 'break';
}

export type IntegrationSource = 'Calendar' | 'Drive' | 'GitHub' | 'Asana' | 'Trello';

export interface Artifact {
  id: string;
  title: string;
  subtitle: string;
  source: IntegrationSource;
  timestamp?: string;
  icon?: string;
}

export interface DailyReportState {
  yesterday: {
    plannedTasks: Task[];
    unplannedWork: string;
    smallTasks: string; 
    summary: string;
    metrics: string; 
  };
  today: {
    bigTask: string;
    bigTaskTime: string;
    isBigTaskBooked: boolean;
    mediumTasks: string;
    smallTasks: string;
    expectedMetrics: string;
  };
  help: {
    blockers: string;
  };
}

// --- Dashboard Types ---

export type Department = 'Engineering' | 'Sales' | 'Marketing' | 'Design' | 'Management';

export interface AppUsage {
  name: string;
  time: string; // "2h 15m"
}

export interface SignalItem {
  id: string;
  title: string;
  time: string; // "14:30"
  type: 'email' | 'doc' | 'meeting';
}

export interface ActivityStats {
  sourceType: 'tracker' | 'signals'; // Tracker = Yaware style, Signals = Gmail/Drive style
  
  // Tracker Fields
  totalTime?: string; // "8h 15m"
  focusTime?: string; // "6h 30m"
  focusPercentage?: number; // 0-100
  topApps?: AppUsage[];

  // Signals Fields (For employees without Timetracker)
  workStart?: string; // "09:15"
  workEnd?: string;   // "18:45"
  
  // Detailed lists instead of just counts
  recentEmails?: SignalItem[];
  recentDocs?: SignalItem[];
  recentMeetings?: SignalItem[];
}

export interface DayReportSummary {
  date: string; // YYYY-MM-DD
  
  // The Plan
  bigTask: string;
  bigTaskStatus: TaskStatus;
  bigTaskTime?: string; // Duration estimate
  mediumTasks?: Task[]; // Structured tasks for better reporting
  smallTasks?: string;  // Text list
  
  // Reality / Context
  unplannedWork?: string; 
  metrics?: string; 
  blockers?: string; 
  
  // Activity Data
  activity?: ActivityStats;
  isMissing?: boolean;

  // Interactions
  hasHelpOffer?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: Department;
  weeklyReports: Record<string, DayReportSummary>;
}