-- CreateTable
CREATE TABLE "DailyReportKPI" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "kpiCode" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "goal" DOUBLE PRECISION,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReportKPI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReportKPI_reportId_kpiCode_key" ON "DailyReportKPI"("reportId", "kpiCode");

-- AddForeignKey
ALTER TABLE "DailyReportKPI" ADD CONSTRAINT "DailyReportKPI_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
