/*
  Warnings:

  - You are about to drop the column `columnVisiblity` on the `View` table. All the data in the column will be lost.
  - Added the required column `columnVisibility` to the `View` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "View" DROP COLUMN "columnVisiblity",
ADD COLUMN     "columnVisibility" JSONB NOT NULL;
