import { DailyReportState, Task } from '@/components/my-day/types';

export function parseDailyReport(text: string): Partial<DailyReportState> {
    // This is a MOCK implementation.
    // In a real app, this would call an LLM API (OpenAI/Gemini).

    // Simple keyword detection for demo purposes
    const lowerText = text.toLowerCase();

    const result: Partial<DailyReportState> = {
        yesterday: {
            plannedTasks: [],
            unplannedWork: '',
            summary: '',
            smallTasks: '',
            metrics: ''
        },
        today: {
            bigTask: '',
            bigTaskTime: '',
            isBigTaskBooked: false,
            mediumTasks: '',
            smallTasks: '',
            expectedMetrics: ''
        },
        help: {
            blockers: ''
        }
    };

    // 1. Parse Yesterday
    // Mock logic: If text contains "вчора" or "yesterday", extract sentences around it.
    // For this demo, we'll just hardcode a smart extraction based on the specific demo text
    // "Вчора я доробив дизайн сторінки налаштувань, але не встиг перевірити мобільну версію."

    if (lowerText.includes('вчора') || lowerText.includes('yesterday')) {
        result.yesterday!.plannedTasks = [
            {
                id: crypto.randomUUID(),
                title: 'Дизайн сторінки налаштувань',
                type: 'Big',
                status: 'done',
                comment: 'Доробив, все ок'
            },
            {
                id: crypto.randomUUID(),
                title: 'Перевірка мобільної версії',
                type: 'Medium',
                status: 'moved',
                comment: 'Не встиг'
            }
        ];
    }

    // 2. Parse Today
    // "Сьогодні планую фіксити баги в навігації та почати інтеграцію API."
    if (lowerText.includes('сьогодні') || lowerText.includes('today')) {
        result.today!.bigTask = 'Фіксити баги в навігації';
        result.today!.bigTaskTime = '4h';
        result.today!.mediumTasks = 'Почати інтеграцію API';
        result.today!.expectedMetrics = '';
    }

    // 3. Parse Blockers
    // "Блокерів немає, але потрібен доступ до стейджингу."
    if (lowerText.includes('блокер') || lowerText.includes('blocker') || lowerText.includes('потрібен')) {
        result.help!.blockers = 'Потрібен доступ до стейджингу';
    }

    // 4. Parse Additional Info (Smart Append Demo)
    // "Додатково: подзвонити клієнту о 14:00 та уточнити вимоги по звітам."
    if (lowerText.includes('додатково') || lowerText.includes('additional')) {
        // Treat as unplanned work or medium task
        result.yesterday!.unplannedWork = 'Подзвонити клієнту о 14:00 та уточнити вимоги по звітам';
        // Also add as a medium task for today
        result.today!.mediumTasks = 'Подзвонити клієнту о 14:00';
    }

    // Fallback if no keywords found (just put everything in summary)
    if (!result.today!.bigTask && !result.yesterday!.plannedTasks?.length && !result.yesterday!.unplannedWork) {
        result.yesterday!.summary = text;
    }

    return result;
}
