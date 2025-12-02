import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

import { getLLMConfig, callLLM, parseJSONFromLLM } from '@/lib/llm';

// POST /api/ai/mentor - Generate AI mentor advice for employee
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const userId = mockUser.id;
        const orgId = mockUser.orgId;
        const body = await request.json();
        const { date } = body;

        // Check if feature is enabled
        const setup = await prisma.organizationSetup.findUnique({
            where: { orgId },
        });

        if (!setup?.aiMentorEnabled) {
            return NextResponse.json(
                { error: 'AI Mentor is not enabled. Complete setup in Settings.' },
                { status: 403 }
            );
        }

        const targetDate = date ? new Date(date) : new Date();
        const dateStr = targetDate.toISOString().split('T')[0];

        // Gather context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                jobRole: {
                    include: {
                        archetype: {
                            select: {
                                mission: true,
                                typicalTasks: true,
                                antiPatterns: true,
                            },
                        },
                    },
                },
                team: {
                    include: {
                        department: true,
                    },
                },
            },
        });

        // Get recent workdays (last 5 days)
        const recentWorkdays = await prisma.workday.findMany({
            where: {
                userId,
                date: { lte: targetDate },
            },
            include: {
                tasks: true,
            },
            orderBy: { date: 'desc' },
            take: 5,
        });

        const todayWorkday = recentWorkdays.find(
            (w) => w.date.toISOString().split('T')[0] === dateStr
        );

        // Get LLM config
        const llmConfig = await getLLMConfig(orgId);

        let advice;

        // Try LLM first, fallback to rule-based
        try {
            if (llmConfig.provider !== 'rule-based' && llmConfig.apiKey) {
                advice = await generateMentorAdviceWithLLM({
                    user,
                    recentWorkdays,
                    todayWorkday,
                    llmConfig,
                });
            } else {
                throw new Error('LLM_DISABLED');
            }
        } catch (error: any) {
            if (error.message === 'LLM_DISABLED') {
                advice = generateMentorAdvice({ user, recentWorkdays, todayWorkday });
            } else {
                console.error('LLM error, using fallback:', error);
                advice = generateMentorAdvice({ user, recentWorkdays, todayWorkday });
            }
        }

        // Store advice
        const aiAdvice = await prisma.aIAdvice.create({
            data: {
                userId,
                type: 'EMPLOYEE_MENTOR',
                content: advice.content,
                metadata: advice.metadata,
            },
        });

        return NextResponse.json({
            advice: aiAdvice,
            context: {
                roleName: user?.jobRole?.name,
                teamName: user?.team?.name,
                departmentName: user?.team?.department?.name,
            },
        });
    } catch (error) {
        console.error('Error generating AI mentor advice:', error);
        return NextResponse.json(
            { error: 'Failed to generate mentor advice' },
            { status: 500 }
        );
    }
}

async function generateMentorAdviceWithLLM({ user, recentWorkdays, todayWorkday, llmConfig }: any) {
    // Calculate metrics
    const todayTasks = todayWorkday?.tasks || [];
    const totalTasks = todayTasks.length;
    const doneCount = todayTasks.filter((t: any) => t.status === 'DONE').length;

    const avgCompletionRate = recentWorkdays.length > 0
        ? recentWorkdays.reduce((sum: number, wd: any) => {
            const total = wd.tasks.length;
            const done = wd.tasks.filter((t: any) => t.status === 'DONE').length;
            return sum + (total > 0 ? done / total : 0);
        }, 0) / recentWorkdays.length
        : 0;

    const systemPrompt = `You are an AI mentor for employees. Provide personalized, actionable advice.
Your response must be valid JSON with this structure:
{
  "actions": ["action 1", "action 2", "action 3"],
  "warnings": ["warning if needed"],
  "insights": ["positive insight or observation"],
  "mainFocus": "suggested main focus for today",
  "summary": "one-line summary"
}`;

    const prompt = `Employee context:
- Role: ${user?.jobRole?.name || 'Employee'}
- Mission: ${user?.jobRole?.archetype?.mission || 'Not set'}
- Today's tasks: ${totalTasks} (${doneCount} done)
- Recent completion rate: ${Math.round(avgCompletionRate * 100)}%
- Main focus today: ${todayWorkday?.mainFocus || 'Not set'}

Provide top 3 actionable recommendations for today.`;

    const response = await callLLM(llmConfig, {
        prompt,
        systemPrompt,
        maxTokens: 600,
        temperature: 0.7,
    });

    const parsed = parseJSONFromLLM(response);

    return {
        content: {
            actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : ['Focus on your most important task'],
            warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
            insights: Array.isArray(parsed.insights) ? parsed.insights : [],
            mainFocus: parsed.mainFocus || todayWorkday?.mainFocus || 'Not set',
            summary: parsed.summary || 'AI mentor advice generated',
        },
        metadata: {
            taskCount: totalTasks,
            completionRate: avgCompletionRate,
            generatedAt: new Date().toISOString(),
            version: 'llm-v1',
            source: 'llm',
        },
    };
}

// Rule-based mentor advice generator (fallback)
function generateMentorAdvice({ user, recentWorkdays, todayWorkday }: any) {
    const actions: string[] = [];
    const warnings: string[] = [];
    const insights: string[] = [];

    const todayTasks = todayWorkday?.tasks || [];
    const plannedCount = todayTasks.filter((t: any) => t.status === 'PLANNED').length;
    const inProgressCount = todayTasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
    const doneCount = todayTasks.filter((t: any) => t.status === 'DONE').length;
    const totalTasks = todayTasks.length;

    if (totalTasks > 8) {
        warnings.push('⚠️ You have many tasks today. Consider prioritizing the top 3.');
        actions.push('Review your task list and mark 2-3 as HIGH priority');
    }

    if (totalTasks === 0 && todayWorkday) {
        warnings.push('📝 No tasks planned yet. Start with a clear plan for the day.');
        actions.push('Add 3-5 tasks you want to accomplish today');
    }

    const avgCompletionRate = recentWorkdays.length > 0
        ? recentWorkdays.reduce((sum: number, wd: any) => {
            const total = wd.tasks.length;
            const done = wd.tasks.filter((t: any) => t.status === 'DONE').length;
            return sum + (total > 0 ? done / total : 0);
        }, 0) / recentWorkdays.length
        : 0;

    if (avgCompletionRate < 0.5 && recentWorkdays.length >= 3) {
        insights.push('📊 Your completion rate has been low recently. Let\'s focus on smaller, achievable tasks.');
        actions.push('Break down complex tasks into smaller steps');
    } else if (avgCompletionRate > 0.8) {
        insights.push('🎉 Great job! Your completion rate is strong.');
    }

    if (user?.jobRole?.archetype?.mission) {
        insights.push(`🎯 Remember your mission: "${user.jobRole.archetype.mission}"`);
    }

    if (actions.length === 0) {
        if (doneCount > 0 && totalTasks > 0) {
            actions.push('Continue your momentum and tackle the next priority task');
        } else if (inProgressCount > 0) {
            actions.push('Focus on completing in-progress tasks before starting new ones');
        } else {
            actions.push('Start your day by tackling your most important task');
            actions.push('Block 2 hours of focused time for deep work');
            actions.push('Review your progress before end of day');
        }
    }

    let mainFocus = todayWorkday?.mainFocus || 'Not set';
    if (mainFocus === 'Not set' && todayTasks.length > 0) {
        const highPriorityTask = todayTasks.find((t: any) => t.priority === 'HIGH' || t.priority === 'URGENT');
        if (highPriorityTask) {
            mainFocus = highPriorityTask.title;
        }
    }

    return {
        content: {
            actions: actions.slice(0, 3),
            warnings,
            insights,
            mainFocus,
            summary: actions.length > 0 ? actions[0] : 'Focus on your most important task today',
        },
        metadata: {
            taskCount: totalTasks,
            completionRate: avgCompletionRate,
            generatedAt: new Date().toISOString(),
            version: 'rule-based-v1',
            source: 'rule-based',
        },
    };
}
