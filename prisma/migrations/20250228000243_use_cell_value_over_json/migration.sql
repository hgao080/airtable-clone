/*
  Warnings:

  - You are about to drop the column `values` on the `Row` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Row" DROP COLUMN "values";

-- CreateTable
CREATE TABLE "Cell" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cell_columnId_value_idx" ON "Cell"("columnId", "value");

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;
