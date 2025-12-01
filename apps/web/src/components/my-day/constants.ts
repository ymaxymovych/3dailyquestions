import { CalendarEvent, Artifact, DailyReportState } from './types';

export const TODAY_EVENTS: CalendarEvent[] = [
    { id: '1', title: 'Daily Standup', time: '09:30', durationMinutes: 15, type: 'meeting' },
    { id: '2', title: 'Design Review', time: '11:00', durationMinutes: 60, type: 'meeting' },
    { id: '3', title: 'Lunch Break', time: '13:00', durationMinutes: 60, type: 'break' },
    { id: '4', title: 'Team Sync', time: '16:00', durationMinutes: 30, type: 'meeting' },
];

export const MOCK_ARTIFACTS: Record<string, Artifact[]> = {
    Calendar: [
        { id: 'c1', title: 'Client Meeting: Project X', subtitle: '10:00 - 11:00', source: 'Calendar' },
        { id: 'c2', title: 'Design Review', subtitle: '14:00 - 15:00', source: 'Calendar' },
    ],
    Drive: [
        { id: 'd1', title: 'Q4 Report Draft.pdf', subtitle: 'Edited 2h ago', source: 'Drive' },
        { id: 'd2', title: 'Product Specs v2.docx', subtitle: 'Opened yesterday', source: 'Drive' },
    ],
    GitHub: [
        { id: 'g1', title: 'Fix login bug #123', subtitle: 'PR #456 (Open)', source: 'GitHub' },
        { id: 'g2', title: 'Update dependencies', subtitle: 'PR #457 (Merged)', source: 'GitHub' },
    ],
    Asana: [
        { id: 'a1', title: 'Design Homepage', subtitle: 'Due Today', source: 'Asana' },
        { id: 'a2', title: 'Write Documentation', subtitle: 'Due Tomorrow', source: 'Asana' },
    ]
};

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
        // UPDATED FORMAT: Task Name (Duration or Range)
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
