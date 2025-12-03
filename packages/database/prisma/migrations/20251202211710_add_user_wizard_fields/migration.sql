-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userCurrentStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "userWizardCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userWizardSkipped" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "organization_setup" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "companyConfigured" BOOLEAN NOT NULL DEFAULT false,
    "structureConfigured" BOOLEAN NOT NULL DEFAULT false,
    "rolesConfigured" BOOLEAN NOT NULL DEFAULT false,
    "employeesConfigured" BOOLEAN NOT NULL DEFAULT false,
    "processConfigured" BOOLEAN NOT NULL DEFAULT false,
    "goalsConfigured" BOOLEAN NOT NULL DEFAULT false,
    "orgWizardCompleted" BOOLEAN NOT NULL DEFAULT false,
    "orgWizardSkipped" BOOLEAN NOT NULL DEFAULT false,
    "orgCurrentStep" INTEGER NOT NULL DEFAULT 1,
    "aiMentorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "managerDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "taskStructurizerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_setup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_setup_orgId_key" ON "organization_setup"("orgId");

-- AddForeignKey
ALTER TABLE "organization_setup" ADD CONSTRAINT "organization_setup_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
