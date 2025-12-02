import { prisma } from '@repo/database';

export type LLMProvider = 'openai' | 'openrouter' | 'huggingface' | 'rule-based';

interface LLMConfig {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
}

interface LLMRequest {
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
}

/**
 * Get LLM configuration for organization
 */
export async function getLLMConfig(orgId: string): Promise<LLMConfig> {
    const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { aiPolicy: true },
    });

    const llmConfig = (org?.aiPolicy as any)?.llm as LLMConfig | undefined;

    return {
        provider: llmConfig?.provider || 'rule-based',
        apiKey: llmConfig?.apiKey,
        model: llmConfig?.model,
    };
}

/**
 * Call LLM with automatic provider selection
 */
export async function callLLM(
    config: LLMConfig,
    request: LLMRequest
): Promise<string> {
    const { provider, apiKey, model } = config;
    const { prompt, systemPrompt, maxTokens = 500, temperature = 0.7 } = request;

    if (provider === 'rule-based' || !apiKey) {
        throw new Error('LLM_DISABLED'); // Caller should handle with fallback
    }

    if (provider === 'openai') {
        return await callOpenAI(apiKey, model || 'gpt-3.5-turbo', {
            prompt,
            systemPrompt,
            maxTokens,
            temperature,
        });
    }

    if (provider === 'openrouter') {
        return await callOpenRouter(apiKey, model || 'anthropic/claude-3-haiku', {
            prompt,
            systemPrompt,
            maxTokens,
            temperature,
        });
    }

    if (provider === 'huggingface') {
        return await callHuggingFace(
            apiKey,
            model || 'mistralai/Mistral-7B-Instruct-v0.2',
            { prompt, systemPrompt, maxTokens, temperature }
        );
    }

    throw new Error('Unknown provider');
}

async function callOpenAI(
    apiKey: string,
    model: string,
    request: LLMRequest
): Promise<string> {
    const messages: any[] = [];

    if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: request.maxTokens,
            temperature: request.temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callOpenRouter(
    apiKey: string,
    model: string,
    request: LLMRequest
): Promise<string> {
    const messages: any[] = [];

    if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: request.maxTokens,
            temperature: request.temperature,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenRouter API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callHuggingFace(
    apiKey: string,
    model: string,
    request: LLMRequest
): Promise<string> {
    // Hugging Face Inference API uses a simpler format
    let fullPrompt = request.prompt;

    if (request.systemPrompt) {
        fullPrompt = `${request.systemPrompt}\n\n${request.prompt}`;
    }

    const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: request.maxTokens,
                    temperature: request.temperature,
                    return_full_text: false,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Hugging Face API error');
    }

    const data = await response.json();

    // HF returns array of generated texts
    if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
    }
    if (data.generated_text) {
        return data.generated_text;
    }

    throw new Error('Unexpected response format from Hugging Face');
}

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
export function parseJSONFromLLM(text: string): any {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
    }

    // Try direct JSON parse
    try {
        return JSON.parse(text);
    } catch {
        // Try to find first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(text.substring(start, end + 1));
        }
    }

    throw new Error('Could not parse JSON from LLM response');
}
