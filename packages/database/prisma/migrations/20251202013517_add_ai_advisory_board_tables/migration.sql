-- CreateEnum
CREATE TYPE "ThreeBlocksStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "GoalLevel" AS ENUM ('COMPANY', 'DEPARTMENT', 'TEAM', 'USER');

-- CreateEnum
CREATE TYPE "DayTaskStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'CARRYOVER', 'CANCELED');

-- CreateEnum
CREATE TYPE "TaskSource" AS ENUM ('PLAN', 'REPORT');

-- CreateEnum
CREATE TYPE "AdviceType" AS ENUM ('EMPLOYEE_MENTOR', 'MANAGER_DIGEST', 'TASK_STRUCTURIZER');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "aiPolicy" JSONB,
ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jobRoleId" TEXT,
ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "workSchedule" JSONB;

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "useMinimalisticDesign" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "role_archetypes" ADD COLUMN     "antiPatterns" JSONB,
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "reportTemplate" JSONB,
ADD COLUMN     "typicalTasks" JSONB;

-- CreateTable
CREATE TABLE "three_blocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "yesterdayTasks" TEXT,
    "yesterdayMetrics" TEXT,
    "todayPlan" TEXT,
    "helpNeeded" TEXT,
    "status" "ThreeBlocksStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "three_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orgId" TEXT NOT NULL,
    "deptId" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "RoleLevel" NOT NULL,
    "orgId" TEXT NOT NULL,
    "archetypeId" TEXT,
    "mission" TEXT,
    "responsibilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "GoalLevel" NOT NULL,
    "period" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "deptId" TEXT,
    "teamId" TEXT,
    "userId" TEXT,
    "parentId" TEXT,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workdays" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "mainFocus" TEXT,
    "selfAssessment" INTEGER,
    "reportText" TEXT,
    "blockersText" TEXT,
    "mood" INTEGER,
    "dailyStats" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day_tasks" (
    "id" TEXT NOT NULL,
    "workdayId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "source" "TaskSource" NOT NULL DEFAULT 'PLAN',
    "title" TEXT,
    "outcome" TEXT,
    "steps" JSONB,
    "dod" TEXT,
    "tags" JSONB,
    "priority" TEXT,
    "status" "DayTaskStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_advice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workdayId" TEXT,
    "type" "AdviceType" NOT NULL,
    "content" JSONB NOT NULL,
    "feedback" INTEGER,
    "feedbackText" TEXT,
    "model" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_advice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_digests" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_digests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workday_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "summary" TEXT NOT NULL,
    "signals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workday_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_summaries" (
    "id" TEXT NOT NULL,
    "workdayId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "three_blocks_userId_date_idx" ON "three_blocks"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "three_blocks_userId_date_key" ON "three_blocks"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "workdays_userId_date_key" ON "workdays"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "manager_digests_managerId_date_key" ON "manager_digests"("managerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "workday_summaries_userId_date_key" ON "workday_summaries"("userId", "date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "job_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "three_blocks" ADD CONSTRAINT "three_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "role_archetypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workdays" ADD CONSTRAINT "workdays_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_tasks" ADD CONSTRAINT "day_tasks_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "workdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_advice" ADD CONSTRAINT "ai_advice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_advice" ADD CONSTRAINT "ai_advice_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "workdays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workday_summaries" ADD CONSTRAINT "workday_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_summaries" ADD CONSTRAINT "integration_summaries_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "workdays"("id") ON DELETE CASCADE ON UPDATE CASCADE;
