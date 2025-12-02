'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lightbulb, ListChecks, Target, AlertTriangle } from 'lucide-react';

interface StructuredTask {
    title: string;
    outcome: string;
    steps: string[];
    dod: string[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface TaskStructurizerDialogProps {
    trigger: React.ReactNode;
    onTaskStructured?: (structured: StructuredTask) => void;
}

export function TaskStructurizerDialog({ trigger, onTaskStructured }: TaskStructurizerDialogProps) {
    const [open, setOpen] = useState(false);
    const [rawText, setRawText] = useState('');
    const [loading, setLoading] = useState(false);
    const [structured, setStructured] = useState<{
        rawText: string;
        structured: StructuredTask;
        confidence: Record<string, number>;
        source: 'llm' | 'rule-based';
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleStructure = async () => {
        if (!rawText.trim()) {
            setError('Please enter task description');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/structure-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to structure task');
            }

            const data = await response.json();
            setStructured(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (structured && onTaskStructured) {
            onTaskStructured(structured.structured);
        }
        setOpen(false);
        setRawText('');
        setStructured(null);
        setError(null);
    };

    const handleReset = () => {
        setStructured(null);
        setError(null);
    };

    const priorityColors = {
        LOW: 'bg-slate-100 text-slate-700 border-slate-300',
        MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
        HIGH: 'bg-amber-100 text-amber-700 border-amber-300',
        URGENT: 'bg-red-100 text-red-700 border-red-300',
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        AI Task Structurizer
                    </DialogTitle>
                    <DialogDescription>
                        Transform raw task descriptions into structured, actionable tasks with AI assistance
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!structured ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Task Description
                            </label>
                            <Textarea
                                placeholder="Enter your task description here... 
Example: 
Implement user authentication
- Add login page
- Create JWT tokens
- So that users can securely access their accounts"
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                rows={8}
                                className="resize-none"
                            />
                        </div>

                        <Button
                            onClick={handleStructure}
                            disabled={loading || !rawText.trim()}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Lightbulb className="h-4 w-4 mr-2" />
                                    Structure Task
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Source indicator */}
                        <div className="flex items-center justify-between">
                            <Badge variant={structured.source === 'llm' ? 'default' : 'secondary'}>
                                {structured.source === 'llm' ? '✨ AI-Powered' : '📋 Rule-Based'}
                            </Badge>
                            <Badge className={priorityColors[structured.structured.priority]}>
                                {structured.structured.priority}
                            </Badge>
                        </div>

                        {/* Title */}
                        <div>
                            <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                Task Title
                            </h4>
                            <p className="text-base font-medium">{structured.structured.title}</p>
                        </div>

                        {/* Outcome */}
                        <div>
                            <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                <Target className="h-4 w-4 text-green-600" />
                                Expected Outcome
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {structured.structured.outcome}
                            </p>
                        </div>

                        {/* Steps */}
                        {structured.structured.steps.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <ListChecks className="h-4 w-4 text-purple-600" />
                                    Implementation Steps
                                </h4>
                                <ul className="space-y-1">
                                    {structured.structured.steps.map((step, idx) => (
                                        <li key={idx} className="text-sm flex items-start gap-2">
                                            <span className="text-purple-600 font-medium">
                                                {idx + 1}.
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Definition of Done */}
                        {structured.structured.dod.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <ListChecks className="h-4 w-4 text-green-600" />
                                    Definition of Done
                                </h4>
                                <ul className="space-y-1">
                                    {structured.structured.dod.map((item, idx) => (
                                        <li key={idx} className="text-sm flex items-start gap-2">
                                            <span className="text-green-600">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleReset} className="flex-1">
                                Try Again
                            </Button>
                            <Button onClick={handleApply} className="flex-1">
                                Apply Structure
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
