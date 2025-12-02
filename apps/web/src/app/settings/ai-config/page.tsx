'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, Brain, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

type LLMProvider = 'openai' | 'openrouter' | 'huggingface' | 'rule-based';

interface LLMConfig {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
}

const PROVIDER_INFO = {
    'rule-based': {
        name: 'Rule-based (No LLM)',
        description: 'Fast, free, works offline. Less nuanced advice.',
        icon: '🔧',
        requiresKey: false,
        models: [],
        limit: '∞ Unlimited',
    },
    openai: {
        name: 'OpenAI',
        description: 'GPT models. High quality, paid.',
        icon: '🤖',
        requiresKey: true,
        models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o'],
        limit: 'По оплаті',
    },
    openrouter: {
        name: 'OpenRouter',
        description: 'Access multiple models. 50 requests/day free.',
        icon: '🔀',
        requiresKey: true,
        models: [
            'anthropic/claude-3-haiku',
            'mistralai/mistral-7b-instruct',
            'google/gemini-flash-1.5',
        ],
        limit: '50/day безкоштовно',
    },
    huggingface: {
        name: 'Hugging Face',
        description: 'Open models. 500 requests/day free.',
        icon: '🤗',
        requiresKey: true,
        models: [
            'mistralai/Mistral-7B-Instruct-v0.2',
            'meta-llama/Llama-2-7b-chat-hf',
        ],
        limit: '500/day безкоштовно',
    },
};

export default function AIConfigPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const [provider, setProvider] = useState<LLMProvider>('rule-based');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('');
    const [testResult, setTestResult] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/organization');
            if (response.ok) {
                const org = await response.json();
                const llmConfig = org.aiPolicy?.llm as LLMConfig | undefined;

                if (llmConfig) {
                    setProvider(llmConfig.provider || 'rule-based');
                    setApiKey(llmConfig.apiKey || '');
                    setModel(llmConfig.model || '');
                }
            }
        } catch (error) {
            console.error('Failed to fetch LLM config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/organization', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aiPolicy: {
                        llm: {
                            provider,
                            apiKey: apiKey || undefined,
                            model: model || undefined,
                        },
                    },
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'LLM configuration saved successfully',
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/api/ai/test-llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    model,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setTestResult(`✅ Success! Response: "${data.response.substring(0, 100)}..."`);
            } else {
                setTestResult(`❌ Error: ${data.error}`);
            }
        } catch (error: any) {
            setTestResult(`❌ Network error: ${error.message}`);
        } finally {
            setTesting(false);
        }
    };

    const currentProviderInfo = PROVIDER_INFO[provider];
    const availableModels = currentProviderInfo.models;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Brain className="h-8 w-8" />
                    AI Provider Configuration
                </h1>
                <p className="text-muted-foreground mt-2">
                    Configure LLM provider for AI features (Mentor, Digest, Task Structurizer)
                </p>
            </div>

            {/* Provider Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select AI Provider</CardTitle>
                    <CardDescription>
                        Choose between rule-based logic or LLM-powered AI
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map((providerKey) => {
                            const info = PROVIDER_INFO[providerKey];
                            return (
                                <div
                                    key={providerKey}
                                    onClick={() => setProvider(providerKey)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${provider === providerKey
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                            : 'border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{info.icon}</div>
                                    <h3 className="font-semibold mb-1">{info.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {info.description}
                                    </p>
                                    <Badge variant="secondary" className="text-xs">
                                        {info.limit}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* API Key Configuration */}
            {currentProviderInfo.requiresKey && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            API Key for {currentProviderInfo.name}
                        </CardTitle>
                        <CardDescription>
                            Your API key is stored securely and only used for AI requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={`Enter your ${currentProviderInfo.name} API key`}
                            />
                        </div>

                        {availableModels.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model</Label>
                                <Select value={model} onValueChange={setModel}>
                                    <SelectTrigger id="model">
                                        <SelectValue placeholder="Select a model..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableModels.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    💡 Tip: Use cheapest models for testing (e.g., claude-3-haiku, mistral-7b)
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={handleTest}
                            disabled={testing || !apiKey}
                            variant="outline"
                            className="w-full"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Test Connection
                                </>
                            )}
                        </Button>

                        {testResult && (
                            <Alert className={testResult.startsWith('✅') ? 'border-green-500' : 'border-red-500'}>
                                <AlertDescription className="text-sm">
                                    {testResult}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Current Configuration Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="font-medium">{currentProviderInfo.name}</span>
                        </div>
                        {model && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Model:</span>
                                <span className="font-medium">{model}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">API Key:</span>
                            <span className="font-medium">
                                {apiKey ? '••••••••' + apiKey.slice(-4) : 'Not set'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Limit:</span>
                            <span className="font-medium">{currentProviderInfo.limit}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={fetchConfig}>
                    Reset
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Save Configuration
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
