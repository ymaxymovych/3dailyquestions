/**
 * Бібліотека архетипів ролей, департаментів та KPI
 */

export interface KPIDefinition {
    code: string;
    name: string;
    description: string;
    unit: string;
    direction: "більше краще" | "менше краще" | "цільове значення";
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
}

export interface RoleArchetypeDefinition {
    code: string;
    name: string;
    level: "IC" | "TEAMLEAD" | "HEAD" | "CLEVEL";
    description: string;
    kpis: KPIDefinition[];
}

export interface DepartmentDefinition {
    code: string;
    name: string;
    description: string;
    roles: RoleArchetypeDefinition[];
}

// SALES
export const SALES_DEPARTMENT: DepartmentDefinition = {
    code: "SALES",
    name: "Продажі",
    description: "Генерація попиту, робота з лідами, закриття угод",
    roles: [
        {
            code: "SALES_SDR",
            name: "SDR / Лідогенератор",
            level: "IC",
            description: "Знаходить і прогріває нові ліди",
            kpis: [
                { code: "LEADS_CREATED_DAILY", name: "Нові ліди за день", description: "Кількість нових лідів у CRM", unit: "кількість", direction: "більше краще", frequency: "DAILY" },
                { code: "CALLS_MADE", name: "Здійснені дзвінки", description: "Кількість дзвінків", unit: "кількість", direction: "більше краще", frequency: "DAILY" },
                { code: "MEETINGS_BOOKED", name: "Заброньовані зустрічі", description: "Зустрічі для AE", unit: "кількість", direction: "більше краще", frequency: "DAILY" },
                { code: "LEAD_TO_MEETING_RATE", name: "Конверсія в зустріч", description: "Відсоток лідів", unit: "%", direction: "більше краще", frequency: "WEEKLY" }
            ]
        },
        {
            code: "SALES_AE",
            name: "Account Executive",
            level: "IC",
            description: "Веде ліди до підписання",
            kpis: [
                { code: "QUALIFIED_OPPS", name: "Кваліфіковані можливості", description: "Угоди qualified", unit: "кількість", direction: "більше краще", frequency: "DAILY" },
                { code: "WIN_RATE", name: "Конверсія в угоду", description: "Частка виграних", unit: "%", direction: "більше краще", frequency: "MONTHLY" },
                { code: "REVENUE_CLOSED", name: "Закритий дохід", description: "Підписані контракти", unit: "грн", direction: "більше краще", frequency: "MONTHLY" }
            ]
        },
        {
            code: "SALES_LEAD",
            name: "Team Lead Sales",
            level: "TEAMLEAD",
            description: "Керування командою продажів",
            kpis: [
                { code: "TEAM_QUOTA", name: "Виконання плану", description: "Відсоток виконання", unit: "%", direction: "більше краще", frequency: "MONTHLY" }
            ]
        },
        {
            code: "SALES_VP",
            name: "VP Sales",
            level: "CLEVEL",
            description: "Стратегія продажів",
            kpis: [
                { code: "TOTAL_REVENUE", name: "Загальний дохід", description: "Дохід від продажів", unit: "грн", direction: "більше краще", frequency: "MONTHLY" }
            ]
        }
    ]
};

// MARKETING
export const MARKETING_DEPARTMENT: DepartmentDefinition = {
    code: "MKT",
    name: "Маркетинг",
    description: "Трафік, ліди, бренд",
    roles: [
        {
            code: "MKT_PERF",
            name: "Performance Specialist",
            level: "IC",
            description: "Платна реклама",
            kpis: [
                { code: "MKT_LEADS", name: "Нові ліди", description: "Ліди за період", unit: "кількість", direction: "більше краще", frequency: "DAILY" },
                { code: "MKT_CPL", name: "Вартість ліда", description: "CPL", unit: "грн", direction: "менше краще", frequency: "DAILY" }
            ]
        },
        {
            code: "MKT_GROWTH_LEAD",
            name: "Growth Lead",
            level: "TEAMLEAD",
            description: "Зростання",
            kpis: [
                { code: "MKT_MQL", name: "MQL", description: "Qualified leads", unit: "кількість", direction: "більше краще", frequency: "WEEKLY" }
            ]
        },
        {
            code: "MKT_CMO",
            name: "CMO",
            level: "CLEVEL",
            description: "Стратегія маркетингу",
            kpis: [
                { code: "MKT_REVENUE", name: "Атрибутований дохід", description: "Дохід від маркетингу", unit: "грн", direction: "більше краще", frequency: "MONTHLY" }
            ]
        }
    ]
};

// PRODUCT & ENGINEERING
export const PRODENG_DEPARTMENT: DepartmentDefinition = {
    code: "PRODENG",
    name: "Product & Engineering",
    description: "Продукт та розробка",
    roles: [
        {
            code: "ENG_DEV",
            name: "Software Engineer",
            level: "IC",
            description: "Розробка",
            kpis: [
                { code: "STORIES_COMPLETED", name: "Завершені stories", description: "User stories", unit: "кількість", direction: "більше краще", frequency: "WEEKLY" }
            ]
        },
        {
            code: "ENG_LEAD",
            name: "Tech Lead",
            level: "TEAMLEAD",
            description: "Технічне лідерство",
            kpis: [
                { code: "TEAM_VELOCITY", name: "Velocity", description: "Story points", unit: "points", direction: "більше краще", frequency: "WEEKLY" }
            ]
        },
        {
            code: "ENG_CTO",
            name: "CTO",
            level: "CLEVEL",
            description: "Технічна стратегія",
            kpis: [
                { code: "TECH_DEBT", name: "Техборг", description: "Відсоток на техборг", unit: "%", direction: "менше краще", frequency: "MONTHLY" }
            ]
        }
    ]
};

// CUSTOMER SUCCESS
export const CS_DEPARTMENT: DepartmentDefinition = {
    code: "CS",
    name: "Customer Success",
    description: "Підтримка клієнтів",
    roles: [
        {
            code: "CS_SUPPORT",
            name: "Support Agent",
            level: "IC",
            description: "Обробка тікетів",
            kpis: [
                { code: "TICKETS_HANDLED", name: "Оброблені тікети", description: "Закриті тікети", unit: "кількість", direction: "більше краще", frequency: "DAILY" }
            ]
        },
        {
            code: "CS_HEAD",
            name: "Head of CS",
            level: "HEAD",
            description: "Стратегія утримання",
            kpis: [
                { code: "CS_CHURN", name: "Churn", description: "Відтік клієнтів", unit: "%", direction: "менше краще", frequency: "MONTHLY" }
            ]
        }
    ]
};

// OPERATIONS
export const OPS_DEPARTMENT: DepartmentDefinition = {
    code: "OPS",
    name: "Operations",
    description: "Операції та проєкти",
    roles: [
        {
            code: "OPS_PM",
            name: "Project Manager",
            level: "IC",
            description: "Управління проєктами",
            kpis: [
                { code: "ON_TIME_DELIVERY", name: "Вчасне завершення", description: "Частка вчасних задач", unit: "%", direction: "більше краще", frequency: "WEEKLY" }
            ]
        },
        {
            code: "OPS_MANAGER",
            name: "Operations Manager",
            level: "HEAD",
            description: "Управління операціями",
            kpis: [
                { code: "OPS_MARGIN", name: "Маржа", description: "Прибуток", unit: "%", direction: "більше краще", frequency: "MONTHLY" }
            ]
        }
    ]
};

export const DEPARTMENTS_LIBRARY = [
    SALES_DEPARTMENT,
    MARKETING_DEPARTMENT,
    PRODENG_DEPARTMENT,
    CS_DEPARTMENT,
    OPS_DEPARTMENT
];

export const LIBRARY_STATS = {
    totalDepartments: DEPARTMENTS_LIBRARY.length,
    totalRoles: DEPARTMENTS_LIBRARY.reduce((sum, dept) => sum + dept.roles.length, 0),
    totalKPIs: DEPARTMENTS_LIBRARY.reduce(
        (sum, dept) => sum + dept.roles.reduce((roleSum, role) => roleSum + role.kpis.length, 0),
        0
    )
};

console.log('📚 Roles Library Stats:', LIBRARY_STATS);
