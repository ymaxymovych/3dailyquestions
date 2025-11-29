import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TextParserService } from './services/text-parser.service';
import { DailyPlan, LoadStatus, TaskType } from '@repo/database';

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

    // Detailed breakdown
    bigMinutes: number;
    mediumMinutes: number;
    smallMinutes: number;
    taskCount: number;
    totalLoadMinutes: number;
}

@Injectable()
export class MyDayService {
    constructor(
        private prisma: PrismaService,
        private textParser: TextParserService,
    ) { }

    async getOrCreatePlan(userId: string, date: string): Promise<DailyPlan> {
        const dateObj = new Date(date);

        let plan = await this.prisma.dailyPlan.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: dateObj,
                },
            },
            include: {
                tasks: true,
                metrics: true,
            },
        });

        if (!plan) {
            // Create new plan with default template
            const defaultText = this.getDefaultTemplate();

            plan = await this.prisma.dailyPlan.create({
                data: {
                    userId,
                    date: dateObj,
                    rawText: defaultText,
                },
                include: {
                    tasks: true,
                    metrics: true,
                },
            });
        }

        return plan;
    }

    async updatePlanText(userId: string, date: string, text: string): Promise<DailyPlan> {
        const dateObj = new Date(date);

        // 1. Parse text
        const parsed = this.textParser.parseDailyText(text, dateObj);

        // Transaction to update plan and replace tasks/metrics
        const plan = await this.prisma.$transaction(async (tx) => {
            // Find existing plan
            const existingPlan = await tx.dailyPlan.findUnique({
                where: { userId_date: { userId, date: dateObj } },
            });

            if (!existingPlan) {
                throw new NotFoundException('Plan not found');
            }

            // Delete old tasks/metrics
            await tx.dailyTask.deleteMany({ where: { planId: existingPlan.id } });
            await tx.dailyMetric.deleteMany({ where: { planId: existingPlan.id } });

            // Create new tasks
            if (parsed.tasks.length > 0) {
                await tx.dailyTask.createMany({
                    data: parsed.tasks.map(t => ({
                        planId: existingPlan.id,
                        type: t.type,
                        title: t.title,
                        estimateMinutes: t.estimateMinutes,
                        plannedStart: t.plannedStart,
                        plannedEnd: t.plannedEnd,
                        rawLine: t.rawLine,
                    })),
                });
            }

            // Create new metrics
            if (parsed.metrics.length > 0) {
                await tx.dailyMetric.createMany({
                    data: parsed.metrics.map(m => ({
                        planId: existingPlan.id,
                        scope: m.scope,
                        name: m.name,
                        value: m.value,
                        comment: m.comment,
                    })),
                });
            }

            // Update plan text
            return tx.dailyPlan.update({
                where: { id: existingPlan.id },
                data: { rawText: text },
                include: { tasks: true, metrics: true },
            });
        });

        // 3. Calculate and update load status
        const loadResult = await this.calculateLoad(plan as any);

        return this.prisma.dailyPlan.update({
            where: { id: plan.id },
            data: {
                loadStatus: loadResult.status,
                effectiveCapacity: loadResult.effectiveCapacityMinutes,
                totalLoad: loadResult.totalLoadMinutes,
            },
            include: { tasks: true, metrics: true },
        });
    }

    async calculateLoad(plan: DailyPlan & { tasks: any[] }): Promise<LoadCalculationResult> {
        // Constants
        const WORK_START_HOUR = 9;
        const WORK_END_HOUR = 18;
        const LUNCH_MINUTES = 60;
        const BUFFER_PERCENT = 0.10;
        const CONTEXT_SWITCH_MINUTES = 5;

        // 1. Capacity
        const totalWorkMinutes = (WORK_END_HOUR - WORK_START_HOUR) * 60; // 9 * 60 = 540

        const meetingsMinutes = 90; // Mock for MVP

        const bufferMinutes = Math.round(totalWorkMinutes * BUFFER_PERCENT); // 54

        const effectiveCapacityMinutes = totalWorkMinutes - LUNCH_MINUTES - meetingsMinutes - bufferMinutes;

        // 2. Load
        const bigTasks = plan.tasks.filter(t => t.type === TaskType.BIG);
        const mediumTasks = plan.tasks.filter(t => t.type === TaskType.MEDIUM);
        const smallTasks = plan.tasks.filter(t => t.type === TaskType.SMALL);

        const bigMinutes = bigTasks.reduce((sum, t) => sum + t.estimateMinutes, 0);
        const mediumMinutes = mediumTasks.reduce((sum, t) => sum + t.estimateMinutes, 0);
        const smallMinutes = smallTasks.reduce((sum, t) => sum + t.estimateMinutes, 0);

        const focusMinutes = bigMinutes + mediumMinutes + smallMinutes;

        const taskCount = bigTasks.length + mediumTasks.length + smallTasks.length;
        const contextSwitchMinutes = Math.max(0, taskCount - 1) * CONTEXT_SWITCH_MINUTES;

        const totalLoadMinutes = focusMinutes + contextSwitchMinutes;

        // 3. Status
        let status: LoadStatus = LoadStatus.BALANCED;
        if (totalLoadMinutes < 0.6 * effectiveCapacityMinutes) {
            status = LoadStatus.UNDERLOADED;
        } else if (totalLoadMinutes > 1.1 * effectiveCapacityMinutes) {
            status = LoadStatus.OVERLOADED;
        }

        // 4. Recommendation
        let recommendation = '';
        if (status === LoadStatus.OVERLOADED) {
            recommendation = 'Зменшіть кількість Medium задач або перенесіть частину на завтра.';
        } else if (status === LoadStatus.UNDERLOADED) {
            recommendation = 'У вас є запас часу. Розгляньте можливість додати ще одну Medium задачу.';
        } else {
            recommendation = 'Ваш день оптимально заплановано!';
        }

        // 5. Explanation
        const explanation = `Фокус: ${this.formatMinutes(focusMinutes)} · Дрібні задачі: ${this.formatMinutes(smallMinutes)} · Перемикання контексту: ${CONTEXT_SWITCH_MINUTES} хв × ${taskCount} задач = ${contextSwitchMinutes} хв · Разом: ${this.formatMinutes(totalLoadMinutes)} із ${this.formatMinutes(effectiveCapacityMinutes)} доступних → ${status}`;

        return {
            effectiveCapacityMinutes,
            focusMinutes,
            contextSwitchMinutes,
            meetingsMinutes,
            lunchMinutes: LUNCH_MINUTES,
            bufferMinutes,
            status,
            explanation,
            recommendation,
            bigMinutes,
            mediumMinutes,
            smallMinutes,
            taskCount,
            totalLoadMinutes,
        };
    }

    private formatMinutes(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h} год ${m} хв`;
        return `${m} хв`;
    }

    private getDefaultTemplate(): string {
        return `Опишіть, над чим працюєте сьогодні.
Час вказуйте в дужках, наприклад: (45 хв) або (10:00–13:00), якщо хочете забронювати точний проміжок часу.

Порада для Великої справи:
Що зміниться в компанії після того, як ви це зробите? Опишіть результат, а не процес. Використовуйте цифри, якщо це можливо.

---

Одна Велика справа (2–4 години)

Finalize hiring plan for Q1 (10:00–13:00)

---

3–5 середніх справ (по 20–60 хв кожна)

Підготувати оновлення для клієнта X: новий статус по задачах і наступні кроки (45 хв)
Перевірити 10 лідів з LinkedIn і додати їх у CRM (30 хв)
Перевірити 10 лідів в CRM і проставити пріоритет (13:00–13:30)

---

Дрібні справи (просто список)

Відповісти на 3 емейли від клієнтів (15 хв)
Оновити опис задачі в Jira (20 хв)

---

Метрики за вчора (цифрами)

Напишіть коротко, які результати ви отримали вчора.
Формат: Назва метрики: число (опціонально короткий коментар)

Продажі: 2 угоди
Нові ліди: 15
Дзвінки клієнтам: 18

---

Очікувані метрики на сьогодні

Продажі: 3 угоди
Нові ліди: 20
Дзвінки клієнтам: 20`;
    }
}
