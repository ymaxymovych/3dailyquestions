'use server';

export async function getAdminStats() {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        stats: {
            activeWorkspaces: 12,
            scheduledStandups: 156,
            responseRate: 68,
            errorCount: 2,
        },
        activity: [
            { date: 'Mon', responses: 120 },
            { date: 'Tue', responses: 132 },
            { date: 'Wed', responses: 101 },
            { date: 'Thu', responses: 134 },
            { date: 'Fri', responses: 190 },
            { date: 'Sat', responses: 230 },
            { date: 'Sun', responses: 210 },
        ],
        problematicCompanies: [
            {
                id: 'comp_1',
                name: 'Acme Corp',
                sent: 50,
                replied: 5,
                lastActive: '2 days ago',
                status: 'CRITICAL' as const,
            },
            {
                id: 'comp_2',
                name: 'Globex',
                sent: 20,
                replied: 8,
                lastActive: 'Yesterday',
                status: 'WARNING' as const,
            },
        ],
    };
}

export async function getCompanies() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
        { id: '1', name: 'Acme Corp', domain: 'acme.com', users: 12, status: 'ACTIVE', lastActive: 'Today' },
        { id: '2', name: 'Globex', domain: 'globex.com', users: 5, status: 'TRIAL', lastActive: 'Yesterday' },
        { id: '3', name: 'Soylent Corp', domain: 'soylent.com', users: 50, status: 'ACTIVE', lastActive: '1 hour ago' },
        { id: '4', name: 'Initech', domain: 'initech.com', users: 8, status: 'CHURNED', lastActive: '30 days ago' },
    ];
}

export async function getCompanyDetails(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        id,
        name: 'Acme Corp',
        domain: 'acme.com',
        status: 'ACTIVE',
        usersCount: 12,
        activeToday: 8,
        streak: 5,
        timezone: 'Europe/Kiev',
        schedule: { morning: '09:00', evening: '18:00' },
        modules: { voice: true, bigTask: true, weeklyReview: false },
        users: [
            { id: 'u1', name: 'John Doe', email: 'john@acme.com', role: 'ADMIN', lastReply: 'Today', streak: 12, status: 'ACTIVE' },
            { id: 'u2', name: 'Jane Smith', email: 'jane@acme.com', role: 'MEMBER', lastReply: 'Yesterday', streak: 3, status: 'ACTIVE' },
            { id: 'u3', name: 'Bob Wilson', email: 'bob@acme.com', role: 'MEMBER', lastReply: '3 days ago', streak: 0, status: 'INACTIVE' },
        ]
    };
}


