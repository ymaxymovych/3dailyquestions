-- CreateEnum
CREATE TYPE "DocumentLevel" AS ENUM ('COMPANY', 'DEPARTMENT', 'TEAM', 'ROLE', 'PERSON');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('POLICY', 'SOP', 'JOB_DESCRIPTION', 'KPI_GUIDE', 'ONBOARDING', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "level" "DocumentLevel" NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveAt" TIMESTAMP(3),
    "orgId" TEXT NOT NULL,
    "deptId" TEXT,
    "teamId" TEXT,
    "jobRoleId" TEXT,
    "userId" TEXT,
    "parentId" TEXT,
    "createdById" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_acknowledgments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_comments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "formula" TEXT,
    "dataSource" TEXT,
    "direction" "KPIDirection" NOT NULL,
    "targetGreen" DOUBLE PRECISION,
    "targetYellow" DOUBLE PRECISION,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_documents_orgId_level_type_idx" ON "knowledge_documents"("orgId", "level", "type");

-- CreateIndex
CREATE INDEX "knowledge_documents_orgId_status_idx" ON "knowledge_documents"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "document_acknowledgments_documentId_userId_key" ON "document_acknowledgments"("documentId", "userId");

-- CreateIndex
CREATE INDEX "document_comments_documentId_idx" ON "document_comments"("documentId");

-- CreateIndex
CREATE INDEX "kpi_catalog_orgId_idx" ON "kpi_catalog"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_catalog_orgId_code_key" ON "kpi_catalog"("orgId", "code");

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "job_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledge_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_catalog" ADD CONSTRAINT "kpi_catalog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
