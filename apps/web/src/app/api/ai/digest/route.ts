import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

import { getLLMConfig, callLLM, parseJSONFromLLM } from '@/lib/llm';

// POST /api/ai/digest - Generate manager digest for team overview
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
        const { date, teamId, deptId } = body;

        // Check if feature is enabled
        const setup = await prisma.organizationSetup.findUnique({
            where: { orgId },
        });

        if (!setup?.managerDigestEnabled) {
            return NextResponse.json(
                { error: 'Manager Digest is not enabled. Complete setup in Settings.' },
                { status: 403 }
            );
        }

        const targetDate = date ? new Date(date) : new Date();
        const dateStr = targetDate.toISOString().split('T')[0];

        // Determine which team/dept to analyze
        let teamMembers: any[] = [];

        if (teamId) {
            const team = await prisma.team.findUnique({
                where: { id: teamId },
                include: { users: { include: { jobRole: true } } },
            });
            teamMembers = team?.users || [];
        } else if (deptId) {
            const dept = await prisma.department.findUnique({
                where: { id: deptId },
                include: { users: { include: { jobRole: true } } },
            });
            teamMembers = dept?.users || [];
        } else {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { team: { include: { users: { include: { jobRole: true } } } } },
            });
            teamMembers = user?.team?.users || [];
        }

        // Get workdays for all team members
        const memberIds = teamMembers.map((m) => m.id);
        const workdays = await prisma.workday.findMany({
            where: {
                userId: { in: memberIds },
                date: {
                    gte: new Date(targetDate.getTime() - 24 * 60 * 60 * 1000),
                    lte: targetDate,
                },
            },
            include: {
                tasks: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        jobRole: { select: { name: true } },
                    },
                },
            },
        });

        // Get LLM config
        const llmConfig = await getLLMConfig(orgId);

        let digest;

        // Try LLM first, fallback to rule-based
        try {
            if (llmConfig.provider !== 'rule-based' && llmConfig.apiKey) {
                digest = await generateManagerDigestWithLLM({
                    teamMembers,
                    workdays,
                    targetDate: dateStr,
                    llmConfig,
                });
            } else {
                throw new Error('LLM_DISABLED');
            }
        } catch (error: any) {
            if (error.message === 'LLM_DISABLED') {
                digest = generateManagerDigest({ teamMembers, workdays, targetDate: dateStr });
            } else {
                console.error('LLM error, using fallback:', error);
                digest = generateManagerDigest({ teamMembers, workdays, targetDate: dateStr });
            }
        }

        // Store digest
        const managerDigest = await prisma.managerDigest.create({
            data: {
                managerId: userId,
                date: targetDate,
                summary: digest.summary,
                highlights: digest.highlights,
                concerns: digest.concerns,
            },
        });

        return NextResponse.json({
            digest: managerDigest,
            details: digest.details,
        });
    } catch (error) {
        console.error('Error generating manager digest:', error);
        return NextResponse.json(
            { error: 'Failed to generate manager digest' },
            { status: 500 }
        );
    }
}

async function generateManagerDigestWithLLM({ teamMembers, workdays, targetDate, llmConfig }: any) {
    // Group workdays by user
    const workdaysByUser = workdays.reduce((acc: any, wd: any) => {
        if (!acc[wd.userId]) acc[wd.userId] = [];
        acc[wd.userId].push(wd);
        return acc;
    }, {});

    // Gather team summary
    const teamSummary = teamMembers.map((member: any) => {
        const memberWorkdays = workdaysByUser[member.id] || [];
        const todayWorkday = memberWorkdays.find(
            (w: any) => w.date.toISOString().split('T')[0] === targetDate
        );

        return {
            name: member.fullName,
            role: member.jobRole?.name,
            hasReport: !!todayWorkday,
            taskCount: todayWorkday?.tasks?.length || 0,
            mood: todayWorkday?.mood || null,
            blockers: todayWorkday?.tasks?.filter((t: any) => t.isBlocked).length || 0,
        };
    });

    const reportsSubmitted = teamSummary.filter((m: any) => m.hasReport).length;
    const reportRate = teamMembers.length > 0 ? reportsSubmitted / teamMembers.length : 0;

    const systemPrompt = `You are an AI assistant for managers. Analyze team data and provide insights.
Return ONLY valid JSON with this structure:
{
  "highlights": ["positive observation 1", ...],
  "concerns": ["concern or issue 1", ...],
  "peopleNeedingAttention": [{"userId": "id", "name": "name", "reasons": ["reason 1", ...]}],
  "summary": "one-line team summary"
}`;

    const prompt = `Team of ${teamMembers.length}:
Report rate: ${Math.round(reportRate * 100)}%
${JSON.stringify(teamSummary, null, 2)}

Identify team members needing manager attention and provide insights.`;

    const response = await callLLM(llmConfig, {
        prompt,
        systemPrompt,
        maxTokens: 800,
        temperature: 0.6,
    });

    const parsed = parseJSONFromLLM(response);

    return {
        summary: parsed.summary || `Team of ${teamMembers.length}: ${reportsSubmitted} reports`,
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 5) : [],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        peopleNeedingAttention: Array.isArray(parsed.peopleNeedingAttention)
            ? parsed.peopleNeedingAttention
            : [],
        details: teamSummary.reduce((acc: any, m: any, idx: number) => {
            acc[teamMembers[idx].id] = m;
            return acc;
        }, {}),
        metrics: {
            teamSize: teamMembers.length,
            reportsSubmitted,
            reportRate,
            needingAttention: parsed.peopleNeedingAttention?.length || 0,
        },
    };
}

// Rule-based digest generator (fallback)
function generateManagerDigest({ teamMembers, workdays, targetDate }: any) {
    const peopleNeedingAttention: any[] = [];
    const highlights: string[] = [];
    const concerns: string[] = [];
    const details: any = {};

    const workdaysByUser = workdays.reduce((acc: any, wd: any) => {
        if (!acc[wd.userId]) acc[wd.userId] = [];
        acc[wd.userId].push(wd);
        return acc;
    }, {});

    for (const member of teamMembers) {
        const memberWorkdays = workdaysByUser[member.id] || [];
        const todayWorkday = memberWorkdays.find(
            (w: any) => w.date.toISOString().split('T')[0] === targetDate
        );

        let needsAttention = false;
        const reasons: string[] = [];

        if (!todayWorkday) {
            needsAttention = true;
            reasons.push('No daily report submitted');
        } else {
            const tasks = todayWorkday.tasks || [];
            const blockers = tasks.filter((t: any) => t.status === 'BLOCKED' || t.isBlocked);
            const overdueTasks = tasks.filter((t: any) => t.status === 'CARRYOVER');

            if (blockers.length > 0) {
                needsAttention = true;
                reasons.push(`${blockers.length} task(s) blocked`);
            }

            if (todayWorkday.mood && todayWorkday.mood <= 2) {
                needsAttention = true;
                reasons.push('Low mood reported');
            }

            if (overdueTasks.length >= 3) {
                needsAttention = true;
                reasons.push(`${overdueTasks.length} carry-over tasks`);
            }

            if (todayWorkday.mood && todayWorkday.mood >= 4) {
                highlights.push(`${member.fullName} reported positive mood (${todayWorkday.mood}/5)`);
            }

            const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
            if (completedTasks >= 5) {
                highlights.push(`${member.fullName} completed ${completedTasks} tasks`);
            }
        }

        if (needsAttention) {
            peopleNeedingAttention.push({
                userId: member.id,
                name: member.fullName,
                role: member.jobRole?.name,
                reasons,
            });
        }

        details[member.id] = {
            name: member.fullName,
            hasReport: !!todayWorkday,
            taskCount: todayWorkday?.tasks?.length || 0,
            mood: todayWorkday?.mood || null,
            mainFocus: todayWorkday?.mainFocus || null,
        };
    }

    if (peopleNeedingAttention.length > 0) {
        concerns.push(`${peopleNeedingAttention.length} team member(s) need attention`);
    }

    const reportsSubmitted = Object.values(details).filter((d: any) => d.hasReport).length;
    const reportRate = teamMembers.length > 0 ? reportsSubmitted / teamMembers.length : 0;

    if (reportRate < 0.7) {
        concerns.push(`Only ${Math.round(reportRate * 100)}% of team submitted reports`);
    }

    const summary = `Team of ${teamMembers.length}: ${reportsSubmitted} reports, ${peopleNeedingAttention.length} need attention, ${highlights.length} highlights`;

    return {
        summary,
        highlights: highlights.slice(0, 5),
        concerns,
        peopleNeedingAttention,
        details,
        metrics: {
            teamSize: teamMembers.length,
            reportsSubmitted,
            reportRate,
            needingAttention: peopleNeedingAttention.length,
        },
    };
}
