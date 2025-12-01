import { RoleLevel, KPIDirection, KPIFrequency } from '@prisma/client';

// Report Template Types
type FieldType = 'bigTask' | 'mediumTasks' | 'smallTasks' | 'kpi' | 'text' | 'number';

interface ReportField {
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
}

interface ReportSection {
    id: string;
    title: string;
    fields: ReportField[];
}

interface ReportTemplate {
    sections: ReportSection[];
}

// Helper function to create base template
const createBaseTemplate = (): ReportTemplate => ({
    sections: [
        {
            id: 'yesterday',
            title: 'Що зробив учора',
            fields: [
                { id: 'yesterdayBig', label: 'Велика справа', type: 'bigTask', required: false },
                { id: 'yesterdayMedium', label: 'Інші важливі справи', type: 'mediumTasks', required: false },
                { id: 'yesterdaySmall', label: 'Дрібниця', type: 'smallTasks', placeholder: '- відповів на листи\n- заповнив звіт', required: false },
                { id: 'yesterdayMetrics', label: 'Метрики (факт)', type: 'kpi', required: false }
            ]
        },
        {
            id: 'today',
            title: 'План на сьогодні',
            fields: [
                { id: 'todayBig', label: 'Головний фокус', type: 'bigTask', required: true },
                { id: 'todayMedium', label: 'Інші справи', type: 'mediumTasks', required: false },
                { id: 'todaySmall', label: 'Рутина', type: 'smallTasks', placeholder: '- зустріч о 14:00\n- оплатити рахунки', required: false },
                { id: 'todayMetrics', label: 'Метрики (план)', type: 'kpi', required: false }
            ]
        },
        {
            id: 'help',
            title: 'Потрібна допомога',
            fields: [
                { id: 'blockers', label: 'Блокери / Питання', type: 'text', placeholder: 'Що заважає? Де потрібна допомога?', required: false }
            ]
        }
    ]
});



export const DEPARTMENTS_DATA = [
    {
        code: 'SALES',
        name: 'Sales',
        description: 'Revenue generation, customer acquisition, and account management',
        roles: [
            {
                code: 'SALES_SDR',
                name: 'SDR / Lead Generator',
                level: RoleLevel.IC,
                description: 'Outbound prospecting, cold calling, and lead qualification',
                kpis: [
                    { code: 'LEADS_CREATED_DAILY', name: 'Нові ліди за день', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'CONTACTS_TOUCHED_DAILY', name: 'Контактів опрацьовано за день', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'OUTBOUND_EMAILS_SENT', name: 'Вихідні emails/повідомлення', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'CALLS_MADE', name: 'Здійснені дзвінки', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'POSITIVE_RESPONSES', name: 'Позитивні відповіді', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'MEETINGS_BOOKED', name: 'Заброньовані зустрічі/демо', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'LEAD_TO_MEETING_RATE', name: 'Конверсія ліда в зустріч', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'DATA_QUALITY_SCORE', name: 'Якість даних по лідах', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'FOLLOW_UPS_DONE', name: 'Зроблені фолоу-апи', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                ],
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'SALES_AE',
                name: 'Account Executive',
                level: RoleLevel.IC,
                description: 'Closing deals, demos, and managing sales pipeline',
                kpis: [
                    { code: 'QUALIFIED_OPPS_CREATED', name: 'Нові кваліфіковані можливості', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'PIPELINE_VALUE_CREATED', name: 'Додана вартість у пайплайні', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MEETINGS_HELD', name: 'Проведені зустрічі/демо', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'WIN_RATE', name: 'Конверсія в угоду', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'REVENUE_CLOSED', name: 'Закритий дохід', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'SALES_CYCLE_LENGTH', name: 'Тривалість циклу продажу', unit: 'дні', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'FOLLOW_UP_DISCIPLINE', name: 'Виконання фолоу-апів у строк', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MULTI_THREADING_SCORE', name: 'Кількість контактів у компанії', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'UPSELL_CROSSSELL_VALUE', name: 'Додаткові продажі', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'SALES_KAM',
                name: 'Account Manager / KAM',
                level: RoleLevel.IC,
                description: 'Retention, upselling, and client relationship management',
                kpis: [
                    { code: 'RECURRING_REVENUE_MANAGED', name: 'Керований регулярний дохід', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CHURN_RATE', name: 'Відтік клієнтів', unit: '%', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'RETENTION_RATE', name: 'Утримання клієнтів', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'EXPANSION_REVENUE', name: 'Зростання доходу', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'NPS_OR_CSAT', name: 'NPS / CSAT', unit: 'бал', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'RENEWALS_ON_TIME', name: 'Частка продовжень вчасно', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'RISK_ACCOUNTS_COUNT', name: 'Кількість ризикових акаунтів', unit: 'кількість', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'QBR_HELD', name: 'Проведені QBR', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'SALES_LEAD',
                name: 'Head of Sales / Team Lead',
                level: RoleLevel.TEAMLEAD,
                description: 'Team management, quota attainment, and coaching',
                kpis: [
                    { code: 'TEAM_QUOTA_ATTAINMENT', name: 'Виконання плану командою', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'HIRE_RAMP_SUCCESS', name: 'Швидкість виходу новачків на план', unit: 'дні', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'COACHING_SESSIONS_HELD', name: 'Коучингові сесії', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'PROCESS_ADHERENCE_RATE', name: 'Дотримання процесу', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'FORECAST_ACCURACY', name: 'Точність прогнозу', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'TEAM_TURNOVER', name: 'Плинність кадрів', unit: '%', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'BEST_PRACTICE_SHARING', name: 'Внутрішні тренінги', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'SALES_VP',
                name: 'VP Sales / Commercial Director',
                level: RoleLevel.CLEVEL,
                description: 'Sales strategy, financial planning, and structural decisions',
                kpis: [
                    { code: 'TOTAL_REVENUE', name: 'Загальний дохід', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'NEW_VS_EXISTING_SPLIT', name: 'Частка нових vs існуючих', unit: '%', direction: KPIDirection.TARGET_VALUE, frequency: KPIFrequency.MONTHLY },
                    { code: 'CAC_PAYBACK_PERIOD', name: 'Строк окупності CAC', unit: 'місяці', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'GROSS_MARGIN', name: 'Маржа продажів', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CHANNEL_PERFORMANCE', name: 'Ефективність каналів', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'HEADCOUNT_PLAN_VS_FACT', name: 'План/факт по команді', unit: '%', direction: KPIDirection.TARGET_VALUE, frequency: KPIFrequency.MONTHLY },
                    { code: 'STRATEGIC_DEALS_PROGRESS', name: 'Стратегічні угоди', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            }
        ]
    },
    {
        code: 'MKT',
        name: 'Marketing / Growth',
        description: 'Demand generation, brand awareness, and growth experiments',
        roles: [
            {
                code: 'MKT_PERF',
                name: 'Performance Specialist',
                level: RoleLevel.IC,
                description: 'Paid ads, traffic optimization',
                kpis: [
                    { code: 'MKT_LEADS', name: 'Кількість нових лідів', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'MKT_CPL', name: 'Вартість ліда (CPL)', unit: 'грн', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_CPA_SIGNUP', name: 'Вартість дії (CPA)', unit: 'грн', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_ROAS', name: 'ROAS', unit: 'x', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_CTR', name: 'CTR', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'MKT_CONTENT',
                name: 'Content Specialist',
                level: RoleLevel.IC,
                description: 'Content creation, SMM, copywriting',
                kpis: [
                    { code: 'MKT_CONTENT_PIECES_CREATED', name: 'Створено контенту', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_CONTENT_PUBLISHED', name: 'Опубліковано', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_SOCIAL_REACH', name: 'Охоплення', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_ENGAGEMENT_RATE', name: 'Engagement Rate', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_SESSIONS', name: 'Сеанси (трафік)', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'MKT_EMAIL_CRM',
                name: 'Email / CRM Marketer',
                level: RoleLevel.IC,
                description: 'Email campaigns, segmentation, retention funnels',
                kpis: [
                    { code: 'MKT_EMAIL_OPEN_RATE', name: 'Open Rate', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_EMAIL_CLICK_RATE', name: 'Click Rate', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_MQL', name: 'MQLs Generated', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'MKT_GROWTH_LEAD',
                name: 'Growth Lead',
                level: RoleLevel.TEAMLEAD,
                description: 'Acquisition strategy, experiments',
                kpis: [
                    { code: 'MKT_PIPELINE_VALUE', name: 'Створена воронка', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_LEAD_TO_OPP_RATE', name: 'Lead to Opportunity', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'MKT_UNIQUE_USERS', name: 'Унікальні користувачі', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'MKT_LP_CVR', name: 'Конверсія лендингів', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'MKT_CMO',
                name: 'CMO',
                level: RoleLevel.CLEVEL,
                description: 'Marketing strategy, budget, brand',
                kpis: [
                    { code: 'MKT_REVENUE_ATTRIBUTED', name: 'Атрибутований дохід', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'MKT_CAC', name: 'CAC', unit: 'грн', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'MKT_BOUNCE_RATE', name: 'Bounce Rate', unit: '%', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'MKT_AVG_SESSION_DURATION', name: 'Avg Session Duration', unit: 'сек', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            }
        ]
    },
    {
        code: 'PRODENG',
        name: 'Product & Engineering',
        description: 'Product development, engineering, and technical operations',
        roles: [
            {
                code: 'PROD_PM',
                name: 'Product Manager',
                level: RoleLevel.IC,
                description: 'Product strategy, backlog, prioritization',
                kpis: [
                    { code: 'PRODUCT_FEATURE_ADOPTION', name: 'Feature Adoption', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'PRODUCT_RETENTION', name: 'Retention', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'PRODUCT_NPS', name: 'Product NPS', unit: 'бал', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'PRODUCT_TIME_TO_VALUE', name: 'Time to Value', unit: 'дні', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'DELIVERY_STORIES_COMPLETED', name: 'Stories Completed', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'ENG_DEV',
                name: 'Software Engineer',
                level: RoleLevel.IC,
                description: 'Development, coding, bug fixing',
                kpis: [
                    { code: 'DELIVERY_POINTS_COMPLETED', name: 'Story Points', unit: 'points', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'QUALITY_DEFECTS_FOUND', name: 'Defects Found', unit: 'кількість', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'QUALITY_AUTOTEST_COVERAGE', name: 'Test Coverage', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'ENG_QA',
                name: 'QA Engineer',
                level: RoleLevel.IC,
                description: 'Quality assurance, testing',
                kpis: [
                    { code: 'QUALITY_ESCAPED_BUGS', name: 'Escaped Bugs', unit: 'кількість', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'QUALITY_BUG_REOPEN_RATE', name: 'Bug Reopen Rate', unit: '%', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'QUALITY_DEFECTS_FOUND_QA', name: 'Bugs Found', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'ENG_DEVOPS',
                name: 'DevOps / SRE',
                level: RoleLevel.IC,
                description: 'Infrastructure, uptime, deployment',
                kpis: [
                    { code: 'RELIABILITY_UPTIME', name: 'Uptime', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'RELIABILITY_INCIDENTS', name: 'Incidents', unit: 'кількість', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'RELIABILITY_MTTR', name: 'MTTR', unit: 'години', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'DEPLOY_FREQUENCY', name: 'Deploy Frequency', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'ENG_CTO',
                name: 'CTO',
                level: RoleLevel.CLEVEL,
                description: 'Technical strategy, architecture, leadership',
                kpis: [
                    { code: 'DELIVERY_THROUGHPUT', name: 'Throughput', unit: 'tasks', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'DELIVERY_CYCLE_TIME', name: 'Cycle Time', unit: 'дні', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'RELIABILITY_UPTIME_CTO', name: 'System Uptime', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            }
        ]
    },
    {
        code: 'CS',
        name: 'Customer Success',
        description: 'Customer onboarding, support, and retention',
        roles: [
            {
                code: 'CS_CSM',
                name: 'Customer Success Manager',
                level: RoleLevel.IC,
                description: 'Customer retention and expansion',
                kpis: [
                    { code: 'CS_BOOK_OF_BUSINESS', name: 'Book of Business', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CS_GROSS_RETENTION', name: 'Gross Retention', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CS_NET_RETENTION', name: 'Net Retention', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CS_CHURN', name: 'Churn', unit: '%', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CS_EXPANSION_REVENUE', name: 'Expansion Revenue', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CS_HEALTH_SCORE', name: 'Health Score', unit: 'бал', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'CS_SUPPORT_AGENT',
                name: 'Support Agent',
                level: RoleLevel.IC,
                description: 'Ticket handling, customer support',
                kpis: [
                    { code: 'SUPPORT_TICKETS_HANDLED', name: 'Tickets Handled', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.DAILY },
                    { code: 'SUPPORT_FIRST_RESPONSE_TIME', name: 'First Response Time', unit: 'хв', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'SUPPORT_RESOLUTION_TIME', name: 'Resolution Time', unit: 'год', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'SUPPORT_CSAT', name: 'CSAT', unit: 'бал', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                    { code: 'SUPPORT_SLA_MET', name: 'SLA Met', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.WEEKLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'CS_HEAD',
                name: 'Head of CS',
                level: RoleLevel.HEAD,
                description: 'CS strategy and team management',
                kpis: [
                    { code: 'CS_NET_RETENTION_HEAD', name: 'Net Retention', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'SUPPORT_CSAT_HEAD', name: 'Global CSAT', unit: 'бал', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            }
        ]
    },
    {
        code: 'OPS',
        name: 'Operations',
        description: 'Project delivery, operations, and administration',
        roles: [
            {
                code: 'OPS_PM',
                name: 'Project Manager',
                level: RoleLevel.IC,
                description: 'Project execution and delivery',
                kpis: [
                    { code: 'OPS_PROJECTS_IN_PROGRESS', name: 'Active Projects', unit: 'кількість', direction: KPIDirection.TARGET_VALUE, frequency: KPIFrequency.WEEKLY },
                    { code: 'OPS_ON_TIME_DELIVERY_RATE', name: 'On-time Delivery', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'OPS_DEADLINE_MISSES', name: 'Deadline Misses', unit: 'кількість', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'OPS_BUDGET_ADHERENCE', name: 'Budget Adherence', unit: '%', direction: KPIDirection.TARGET_VALUE, frequency: KPIFrequency.MONTHLY },
                    { code: 'OPS_MARGIN_PER_PROJECT', name: 'Project Margin', unit: '%', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'OPS_MANAGER',
                name: 'Operations Manager',
                level: RoleLevel.HEAD,
                description: 'Operational efficiency and delivery management',
                kpis: [
                    { code: 'OPS_UTILIZATION_RATE', name: 'Utilization Rate', unit: '%', direction: KPIDirection.TARGET_VALUE, frequency: KPIFrequency.MONTHLY },
                    { code: 'OPS_THROUGHPUT', name: 'Throughput', unit: 'кількість', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'OPS_DEFECT_RATE', name: 'Defect Rate', unit: '%', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'OPS_CUSTOMER_COMPLAINTS', name: 'Complaints', unit: 'кількість', direction: KPIDirection.LOWER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            },
            {
                code: 'OPS_CEO',
                name: 'CEO',
                level: RoleLevel.CLEVEL,
                description: 'Chief Executive Officer',
                kpis: [
                    { code: 'CEO_REVENUE', name: 'Total Revenue', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CEO_EBITDA', name: 'EBITDA', unit: 'грн', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                    { code: 'CEO_RUNWAY', name: 'Runway', unit: 'місяці', direction: KPIDirection.HIGHER_BETTER, frequency: KPIFrequency.MONTHLY },
                ]
                ,
                reportTemplate: createBaseTemplate()
            }
        ]
    }
];
