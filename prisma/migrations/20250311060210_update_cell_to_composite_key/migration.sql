/*
  Warnings:

  - The primary key for the `Cell` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Cell` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cell_columnId_value_idx";

-- AlterTable
ALTER TABLE "Cell" DROP CONSTRAINT "Cell_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Cell_pkey" PRIMARY KEY ("columnId", "rowId");
