/*
  Warnings:

  - You are about to drop the `kpi_catalog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "kpi_catalog" DROP CONSTRAINT "kpi_catalog_orgId_fkey";

-- DropTable
DROP TABLE "kpi_catalog";
