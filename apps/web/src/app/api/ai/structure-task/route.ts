import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { getLLMConfig, callLLM, parseJSONFromLLM } from '@/lib/llm';

// POST /api/ai/structure-task - Convert raw task text to structured format
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser || !mockUser.orgId) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }
        const orgId = mockUser.orgId;

        const body = await request.json();
        const { rawText } = body;

        if (!rawText || typeof rawText !== 'string') {
            return NextResponse.json(
                { error: 'rawText is required' },
                { status: 400 }
            );
        }

        // Get LLM config
        const llmConfig = await getLLMConfig(orgId);

        let structured;

        // Try LLM first, fallback to rule-based
        try {
            if (llmConfig.provider !== 'rule-based' && llmConfig.apiKey) {
                structured = await structureTaskWithLLM(rawText, llmConfig);
            } else {
                throw new Error('LLM_DISABLED');
            }
        } catch (error: any) {
            if (error.message === 'LLM_DISABLED') {
                // Fallback to rule-based
                structured = parseTaskText(rawText);
            } else {
                // LLM error, also fallback
                console.error('LLM error, using fallback:', error);
                structured = parseTaskText(rawText);
            }
        }

        return NextResponse.json(structured);
    } catch (error) {
        console.error('Error structuring task:', error);
        return NextResponse.json(
            { error: 'Failed to structure task' },
            { status: 500 }
        );
    }
}

async function structureTaskWithLLM(rawText: string, llmConfig: any) {
    const systemPrompt = `You are a task structuring assistant. Parse raw task descriptions into structured format.
Return ONLY valid JSON with this exact structure:
{
  "title": "concise task title",
  "outcome": "what success looks like",
  "steps": ["step 1", "step 2", ...],
  "dod": ["definition of done item 1", ...],
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}`;

    const prompt = `Parse this task:\n\n${rawText}`;

    const response = await callLLM(llmConfig, {
        prompt,
        systemPrompt,
        maxTokens: 800,
        temperature: 0.3,
    });

    const parsed = parseJSONFromLLM(response);

    return {
        rawText,
        structured: {
            title: parsed.title || rawText.substring(0, 100),
            outcome: parsed.outcome || `Complete: ${parsed.title}`,
            steps: Array.isArray(parsed.steps) ? parsed.steps : [`Complete the task: ${parsed.title}`],
            dod: Array.isArray(parsed.dod) ? parsed.dod : ['Task completed successfully'],
            priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(parsed.priority)
                ? parsed.priority
                : 'MEDIUM',
        },
        confidence: {
            title: 0.95,
            outcome: 0.9,
            steps: 0.9,
            dod: 0.85,
            priority: 0.8,
        },
        source: 'llm',
    };
}

// Rule-based task parser (fallback when LLM is disabled)
function parseTaskText(rawText: string) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const title = lines[0] || rawText.substring(0, 100);

    let outcome = '';
    const outcomePatterns = [
        /(?:so that|to ensure|in order to|to)\s+(.+)/i,
        /(?:goal|outcome|result):\s*(.+)/i,
    ];

    for (const line of lines) {
        for (const pattern of outcomePatterns) {
            const match = line.match(pattern);
            if (match) {
                outcome = match[1].trim();
                break;
            }
        }
        if (outcome) break;
    }

    const steps: string[] = [];
    const stepPatterns = [
        /^[\d]+[\.)]\s*(.+)/,
        /^[-•*]\s*(.+)/,
    ];

    for (const line of lines.slice(1)) {
        for (const pattern of stepPatterns) {
            const match = line.match(pattern);
            if (match) {
                steps.push(match[1].trim());
                break;
            }
        }
    }

    const dod: string[] = [];
    if (title.toLowerCase().includes('fix') || title.toLowerCase().includes('bug')) {
        dod.push('Bug is no longer reproducible');
        dod.push('Tests added to prevent regression');
    } else if (title.toLowerCase().includes('implement') || title.toLowerCase().includes('add')) {
        dod.push('Feature works as expected');
        dod.push('Code reviewed and merged');
    } else {
        dod.push('Task completed successfully');
        dod.push('All acceptance criteria met');
    }

    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    const urgentKeywords = ['urgent', 'critical', 'asap', 'blocker'];
    const highKeywords = ['important', 'priority', 'soon'];
    const lowKeywords = ['nice to have', 'optional', 'later'];

    const lowerText = rawText.toLowerCase();
    if (urgentKeywords.some(kw => lowerText.includes(kw))) {
        priority = 'URGENT';
    } else if (highKeywords.some(kw => lowerText.includes(kw))) {
        priority = 'HIGH';
    } else if (lowKeywords.some(kw => lowerText.includes(kw))) {
        priority = 'LOW';
    }

    return {
        rawText,
        structured: {
            title: title.replace(/^[-•*\d.)]+\s*/, ''),
            outcome: outcome || `Complete: ${title}`,
            steps: steps.length > 0 ? steps : [`Complete the task: ${title}`],
            dod,
            priority,
        },
        confidence: {
            title: 0.9,
            outcome: outcome ? 0.7 : 0.4,
            steps: steps.length > 0 ? 0.8 : 0.3,
            dod: 0.6,
            priority: 0.5,
        },
        source: 'rule-based',
    };
}
