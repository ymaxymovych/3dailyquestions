
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
    isBigTaskBooked: boolean; // New field
    mediumTasks: string;
    smallTasks: string;
    expectedMetrics: string;
  };
  help: {
    blockers: string;
  };
}
