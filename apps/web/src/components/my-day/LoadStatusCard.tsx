'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export enum LoadStatus {
    BALANCED = 'BALANCED',
    OVERLOADED = 'OVERLOADED',
    UNDERLOADED = 'UNDERLOADED',
}

export interface LoadCalculationResult {
    effectiveCapacityMinutes: number;
    focusMinutes: number;
    contextSwitchMinutes: number;
    meetingsMinutes: number;
    lunchMinutes: number;
    bufferMinutes: number;
    status: LoadStatus;
    explanation: string;
    recommendation: string;
    bigMinutes: number;
    mediumMinutes: number;
    smallMinutes: number;
    taskCount: number;
    totalLoadMinutes: number;
}

interface LoadStatusCardProps {
    load: LoadCalculationResult | null;
    className?: string;
}

const LoadStatusCard = ({ load, className }: LoadStatusCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!load) {
        return null;
    }

    const getStatusColor = (status: LoadStatus) => {
        switch (status) {
            case LoadStatus.BALANCED:
                return 'bg-green-100 text-green-800 border-green-200';
            case LoadStatus.OVERLOADED:
                return 'bg-red-100 text-red-800 border-red-200';
            case LoadStatus.UNDERLOADED:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatMinutes = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h} год ${m} хв`;
        return `${m} хв`;
    };

    return (
        <Card className={cn("w-full transition-all duration-300", className)}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <div className={cn("px-3 py-1 rounded-full text-sm font-medium border", getStatusColor(load.status))}>
                            {load.status === LoadStatus.BALANCED && 'Balanced'}
                            {load.status === LoadStatus.OVERLOADED && 'Overloaded'}
                            {load.status === LoadStatus.UNDERLOADED && 'Underloaded'}
                        </div>
                        <span className="text-sm text-muted-foreground hidden sm:inline-block truncate max-w-[500px]">
                            {load.explanation.split('·')[0]} · {load.explanation.split('·')[3]?.split('→')[0]}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {isExpanded ? 'Згорнути' : 'Докладніше'}
                        {isExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="mt-4 space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Capacity Section */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Доступна ємність</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Робочий день (09:00–18:00):</span>
                                        <span>9 год</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Обід:</span>
                                        <span>- {formatMinutes(load.lunchMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Зустрічі (календар):</span>
                                        <span>- {formatMinutes(load.meetingsMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            Буфер (10%)
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                                                    <TooltipContent>Час на непередбачувані обставини</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            :
                                        </span>
                                        <span>- {formatMinutes(load.bufferMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                        <span>Ефективна ємність:</span>
                                        <span>{formatMinutes(load.effectiveCapacityMinutes)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Load Section */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Запланований фокус</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Великі задачі:</span>
                                        <span>{formatMinutes(load.bigMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Середні задачі:</span>
                                        <span>{formatMinutes(load.mediumMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Дрібні задачі:</span>
                                        <span>{formatMinutes(load.smallMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            Перемикання контексту
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                                                    <TooltipContent>5 хв на кожну задачу після першої</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            :
                                        </span>
                                        <span>+ {formatMinutes(load.contextSwitchMinutes)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                        <span>Всього завантаження:</span>
                                        <span>{formatMinutes(load.totalLoadMinutes)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conclusion */}
                        <div className={cn("mt-4 p-3 rounded-md text-sm", getStatusColor(load.status))}>
                            <p className="font-medium flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Висновок: {load.status}
                            </p>
                            <p className="mt-1 opacity-90">{load.recommendation}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LoadStatusCard;
