/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DailyReport" ADD COLUMN     "orgId" TEXT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "maxProjects" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "maxUsers" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "DailyReport_orgId_idx" ON "DailyReport"("orgId");

-- CreateIndex
CREATE INDEX "DailyReport_orgId_date_idx" ON "DailyReport"("orgId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
