
import { DailyReportState, CalendarEvent, Artifact, Employee, SignalItem } from './types';

export const INITIAL_STATE: DailyReportState = {
  yesterday: {
    plannedTasks: [
      {
        id: '1',
        title: 'Finalize hiring plan for Q1',
        type: 'Big',
        timeEstimate: '2h',
        status: 'partial',
        comment: 'Чекаю фідбек від CEO по бюджету'
      },
      {
        id: '2',
        title: 'Call with Client X',
        type: 'Medium',
        timeEstimate: '30m',
        status: 'done',
      },
    ],
    unplannedWork: `Екстрений дзвінок із клієнтом X через баг у релізі (1 год)
Допомога колегам з підготовкою демо (16:20–17:00)`,
    smallTasks: `Code Review: 3 PR-и від джунів (45 хв)
Розбір пошти та Slack (30 хв)`,
    summary: 'У цілому день продуктивний, але по hiring plan потрібне ще одне узгодження.',
    metrics: `Продажі:  2 угоди (CRM)
Нові ліди: 15 (CRM)
Дзвінки:   18 (Jira)`,
  },
  today: {
    bigTask: 'Finalize hiring plan for Q1',
    bigTaskTime: '10:00–13:00',
    isBigTaskBooked: true, 
    mediumTasks: `Підготувати оновлення для клієнта X (45 хв)
Перевірити 10 лідів з LinkedIn і додати їх у CRM (30 хв)
Перевірити 10 лідів в CRM і проставити пріоритет (13:00–13:30)`,
    smallTasks: `Відповісти на 3 емейли (15 хв)
Оновити статус в Jira (10 хв)`,
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

// --- HELPER FOR BULK SIGNALS ---
const generateSignals = (count: number, type: 'email' | 'doc', prefix: string): SignalItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${type}-${i}`,
    title: `${prefix} ${i + 1}: ${type === 'email' ? 'Re: Project Update' : 'Design_Spec_v' + i}`,
    time: `${9 + Math.floor(i/2)}:${(i * 15) % 60 < 10 ? '0' : ''}${(i * 15) % 60}`,
    type
  }));
};

// --- SYNTHETIC TEAM DATA ---

export const MOCK_TEAM: Employee[] = [
  // 1. OLEKSIY - ENGINEERING - FULL TRACKER
  {
    id: 'e1',
    name: 'Олексій (You)',
    role: 'Frontend Lead',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    department: 'Engineering',
    weeklyReports: {
      'Mon': { 
        date: '2023-12-04', 
        bigTask: 'Refactor Context Panel', 
        bigTaskStatus: 'done',
        bigTaskTime: '2h',
        mediumTasks: [
           { id: 'm1', title: 'Fix responsive layout bug', timeEstimate: '1h', type: 'Medium', status: 'done', comment: 'Fixed via flexbox' },
           { id: 'm2', title: 'Update types for drag-n-drop', timeEstimate: '30m', type: 'Medium', status: 'done' }
        ],
        smallTasks: 'Reply to 3 PRs\nSlack cleanup',
        metrics: 'Fixed 3 bugs',
        activity: { 
          sourceType: 'tracker',
          totalTime: '8h 20m', 
          focusTime: '6h 10m', 
          focusPercentage: 75, 
          topApps: [
            { name: 'VS Code', time: '4h 30m' },
            { name: 'Chrome', time: '2h 15m' },
            { name: 'Slack', time: '45m' },
            { name: 'Zoom', time: '30m' },
            { name: 'Figma', time: '20m' }
          ] 
        }
      },
      'Tue': { 
        date: '2023-12-05', 
        bigTask: 'Integrate Yaware API', 
        bigTaskStatus: 'partial',
        bigTaskTime: '4h',
        mediumTasks: [
            { id: 'm1', title: 'Setup OAuth flow', timeEstimate: '2h', type: 'Medium', status: 'done' },
            { id: 'm2', title: 'Test endpoints', timeEstimate: '1h', type: 'Medium', status: 'moved', comment: 'API returned 500 error' }
        ],
        smallTasks: 'Team Sync\nUpdate documentation',
        unplannedWork: 'Prod server incident (2h)\nEmergency meeting (30m)',
        blockers: 'Backend API is unstable',
        activity: { 
          sourceType: 'tracker',
          totalTime: '9h 10m', 
          focusTime: '4h 00m', 
          focusPercentage: 45, 
          topApps: [
            { name: 'Slack', time: '3h 00m' },
            { name: 'Zoom', time: '2h 30m' },
            { name: 'VS Code', time: '1h 30m' },
            { name: 'Terminal', time: '1h 00m' },
            { name: 'Chrome', time: '1h 10m' }
          ] 
        }
      },
      'Wed': { date: '2023-12-06', bigTask: 'Dashboard Grid', bigTaskStatus: 'moved', isMissing: true }
    }
  },

  // 2. SOFIA - DESIGN - SIGNALS ONLY (No Tracker)
  {
    id: 'e3',
    name: 'Софія',
    role: 'Product Designer',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d',
    department: 'Design',
    weeklyReports: {
      'Mon': { 
        date: '2023-12-04', 
        bigTask: 'Mobile App Prototypes', 
        bigTaskStatus: 'partial',
        bigTaskTime: '4h',
        mediumTasks: [
            { id: 'm1', title: 'Profile screen flow', timeEstimate: '2h', type: 'Medium', status: 'done' },
            { id: 'm2', title: 'Settings wireframes', timeEstimate: '1h 30m', type: 'Medium', status: 'partial', comment: 'Waiting for copy' }
        ],
        smallTasks: 'Design critique sync\nExport icons',
        blockers: 'Need final copy from Marketing for Settings page',
        activity: { 
          sourceType: 'signals',
          workStart: '10:00',
          workEnd: '19:30',
          recentDocs: [
            { id: 'd1', title: 'App_UI_Kit_v2.fig', time: '18:15', type: 'doc' },
            { id: 'd2', title: 'User_Flow_Diagram', time: '14:30', type: 'doc' },
            { id: 'd3', title: 'Icon_Set_Export', time: '11:20', type: 'doc' },
            ...generateSignals(12, 'doc', 'Wireframe_Component')
          ],
          recentEmails: [
            { id: 'e1', title: 'Re: Design Sync', time: '10:15', type: 'email' },
            { id: 'e2', title: 'Assets for Devs', time: '17:45', type: 'email' }
          ]
        }
      },
      'Tue': { 
        date: '2023-12-05', 
        bigTask: 'Design System Review', 
        bigTaskStatus: 'done',
        bigTaskTime: '3h',
        mediumTasks: [
            { id: 'm1', title: 'Audit button components', timeEstimate: '1h', type: 'Medium', status: 'done' },
            { id: 'm2', title: 'Update color palette', timeEstimate: '45m', type: 'Medium', status: 'done' }
        ],
        smallTasks: 'Update Zeplin',
        activity: { 
            sourceType: 'signals',
            workStart: '09:45',
            workEnd: '18:15',
            recentDocs: [
                { id: 'd1', title: 'Design_System_Master', time: '16:40', type: 'doc' },
                { id: 'd2', title: 'Button_States_Spec', time: '13:10', type: 'doc' }
            ],
            recentMeetings: [
                { id: 'mt1', title: 'Product Weekly', time: '11:00', type: 'meeting' },
                { id: 'mt2', title: 'Design Critique', time: '15:00', type: 'meeting' }
            ]
        }
      }
    }
  },

  // 3. ANNA - MARKETING - SIGNALS + BLOCKERS
  {
    id: 'e5',
    name: 'Анна',
    role: 'Marketing Manager',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d22',
    department: 'Marketing',
    weeklyReports: {
      'Mon': { 
        date: '2023-12-04', 
        bigTask: 'Q4 Campaign Launch', 
        bigTaskStatus: 'done',
        bigTaskTime: '5h',
        mediumTasks: [
            { id: 'm1', title: 'Finalize ad copy', timeEstimate: '1h', type: 'Medium', status: 'done' },
            { id: 'm2', title: 'Setup Facebook Ads', timeEstimate: '2h', type: 'Medium', status: 'done' }
        ],
        smallTasks: 'Brief designers\nSlack coordination',
        activity: { 
            sourceType: 'signals',
            workStart: '08:30',
            workEnd: '17:00',
            recentEmails: [
                { id: 'e1', title: 'Campaign Approval', time: '16:50', type: 'email' },
                { id: 'e2', title: 'Agency Briefing', time: '14:20', type: 'email' },
                { id: 'e3', title: 'Weekly Digest', time: '09:15', type: 'email' },
                ...generateSignals(25, 'email', 'Client Thread')
            ],
            recentDocs: [
                { id: 'd1', title: 'Q4_Budget_Final.xlsx', time: '15:30', type: 'doc' },
                { id: 'd2', title: 'Ad_Copy_Draft_v3', time: '11:00', type: 'doc' }
            ]
        }
      },
      'Tue': { 
        date: '2023-12-05', 
        bigTask: 'Content Calendar', 
        bigTaskStatus: 'moved',
        bigTaskTime: '2h',
        mediumTasks: [
            { id: 'm1', title: 'Draft blog post', timeEstimate: '1h 30m', type: 'Medium', status: 'partial' }
        ],
        unplannedWork: 'Urgent PR fix for social media (2h)',
        blockers: 'Website CMS is down',
        activity: { 
            sourceType: 'signals',
            workStart: '09:00',
            workEnd: '17:30',
            recentEmails: [
                { id: 'e1', title: 'URGENT: Social Fix', time: '10:15', type: 'email' }
            ],
            recentMeetings: [
                { id: 'mt1', title: 'Emergency Sync', time: '10:30', type: 'meeting' }
            ]
        }
      }
    }
  },

  // 4. DMYTRO - SALES - HYBRID (Sales often have low PC focus but high calls)
  {
    id: 'e4',
    name: 'Дмитро',
    role: 'Sales Manager',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d33',
    department: 'Sales',
    weeklyReports: {
      'Mon': { 
        date: '2023-12-04', 
        bigTask: 'Close Deal with Enterprise X', 
        bigTaskStatus: 'moved',
        bigTaskTime: '3h',
        mediumTasks: [
            { id: 'm1', title: 'Prepare contract draft', timeEstimate: '1h', type: 'Medium', status: 'done' }
        ],
        smallTasks: 'Follow up emails',
        unplannedWork: 'Client demo rescheduled twice',
        activity: { 
          sourceType: 'tracker',
          totalTime: '9h 00m', 
          focusTime: '2h 00m', // Low focus is expected for sales
          focusPercentage: 22, 
          topApps: [
            { name: 'Zoom', time: '4h 00m' },
            { name: 'HubSpot', time: '2h 00m' },
            { name: 'Gmail', time: '1h 30m' },
            { name: 'Phone', time: '30m' },
            { name: 'Slack', time: '1h 00m' }
          ] 
        }
      },
      'Tue': { 
        date: '2023-12-05', 
        bigTask: 'Q1 Sales Strategy', 
        bigTaskStatus: 'partial',
        bigTaskTime: '4h',
        mediumTasks: [
            { id: 'm1', title: 'Analyze competitors', timeEstimate: '2h', type: 'Medium', status: 'done' },
            { id: 'm2', title: 'Update CRM', timeEstimate: '1h', type: 'Medium', status: 'partial' }
        ],
        metrics: '5 cold calls\n2 demos booked',
        activity: { 
            sourceType: 'tracker',
            totalTime: '8h 00m', 
            focusTime: '3h 00m', 
            focusPercentage: 35,
            topApps: [
                { name: 'LinkedIn', time: '3h 00m' },
                { name: 'Zoom', time: '2h 00m' },
                { name: 'Gmail', time: '1h 00m' },
                { name: 'Excel', time: '1h 00m' },
                { name: 'Slack', time: '1h 00m' }
            ]
        }
      }
    }
  }
];