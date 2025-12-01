
import { DailyReportState, CalendarEvent, Artifact } from './types';

export const INITIAL_STATE: DailyReportState = {
  yesterday: {
    plannedTasks: [
      {
        id: '1',
        title: 'Finalize hiring plan for Q1',
        type: 'Big',
        timeEstimate: '2h',
        status: 'partial',
      },
      {
        id: '2',
        title: 'Call with Client X',
        type: 'Medium',
        timeEstimate: '30m',
        status: 'done',
      },
    ],
    unplannedWork: `1 год: екстрений дзвінок із клієнтом X через баг у релізі.
40 хв: допомога колегам з підготовкою демо.`,
    smallTasks: `Відповів на 12 листів у Slack.
Заапровав 3 PR-и від джунів.`,
    summary: 'У цілому день продуктивний, але по hiring plan потрібне ще одне узгодження з CEO.',
    metrics: `Продажі:  2 угоди (CRM)
Нові ліди: 15 (CRM)
Дзвінки:   18 (Jira)`,
  },
  today: {
    bigTask: 'Finalize hiring plan for Q1',
    bigTaskTime: '10:00–13:00',
    isBigTaskBooked: false, // Default false
    mediumTasks: `Підготувати оновлення для клієнта X (45 хв)
Перевірити 10 лідів з LinkedIn і додати їх у CRM (30 хв)
Перевірити 10 лідів в CRM і проставити пріоритет (13:00–13:30)`,
    smallTasks: `Відповісти на 3 емейли
Оновити статус в Jira`,
    expectedMetrics: `Продажі: 3 угоди
Нові ліди: 20`,
  },
  help: {
    blockers: `Потрібне погодження hiring plan до 16:00.
Потрібен доступ до нового репозиторію від DevOps.`,
  },
};

export const YESTERDAY_EVENTS: CalendarEvent[] = [
  { id: '1', time: '10:00', title: 'Daily Standup', durationMinutes: 30, type: 'meeting' },
  { id: '2', time: '11:00', title: 'Dev Sync', durationMinutes: 60, type: 'meeting' },
  { id: '3', time: '14:00', title: 'Demo Client X', durationMinutes: 45, type: 'meeting' },
];

export const TODAY_EVENTS: CalendarEvent[] = [
  { id: '1', time: '09:00', title: 'Email & Prep', durationMinutes: 30, type: 'focus' },
  // Removed static big task event to allow dynamic injection in ContextPanel based on state
  { id: '3', time: '13:00', title: 'Lunch', durationMinutes: 60, type: 'break' },
  { id: '4', time: '14:00', title: 'Client Update', durationMinutes: 45, type: 'meeting' },
  { id: '5', time: '15:00', title: 'Team Sync', durationMinutes: 30, type: 'meeting' },
];

export const MOCK_ARTIFACTS: Record<string, Artifact[]> = {
  Calendar: [
    { id: 'c1', title: 'Redesign Kickoff Meeting', subtitle: '9:00 AM - 9:30 AM • External', source: 'Calendar' },
    { id: 'c2', title: 'Cycle Retrospective', subtitle: '10:00 AM - 10:30 AM', source: 'Calendar' },
    { id: 'c3', title: '1:1 with Team Lead', subtitle: '11:00 AM - 11:30 AM', source: 'Calendar' },
  ],
  Drive: [
    { id: 'd1', title: 'Tech Spec: Fanout feed items', subtitle: 'Edited • Google Spreadsheets', source: 'Drive' },
    { id: 'd2', title: 'Engineering Milestones', subtitle: 'Edited • Google Docs', source: 'Drive' },
    { id: 'd3', title: 'Q4 Hiring Plan', subtitle: 'Viewed • Google Docs', source: 'Drive' },
  ],
  GitHub: [
    { id: 'g1', title: 'Improved error handling for S...', subtitle: 'Assigned • Issue on range-labs/monorepo', source: 'GitHub' },
    { id: 'g2', title: 'Event logging for signup funnel', subtitle: 'Review Requested • PR on range-labs/monorepo', source: 'GitHub' },
  ],
  Asana: [
    { id: 'a1', title: 'Implement tutorial v2', subtitle: 'Assigned • Project: Marketing Requests', source: 'Asana' },
    { id: 'a2', title: 'Update landing page assets', subtitle: 'Completed • Project: Design Systems', source: 'Asana' },
  ]
};

export const ACTIVITY_DATA = [
  { name: 'Documents', hours: 2, fill: '#60a5fa' },
  { name: 'Communication', hours: 1.5, fill: '#34d399' },
  { name: 'Development', hours: 4.6, fill: '#818cf8' },
];
