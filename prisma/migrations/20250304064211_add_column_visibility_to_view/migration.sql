/*
  Warnings:

  - Added the required column `columnVisiblity` to the `View` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "View" ADD COLUMN     "columnVisiblity" JSONB NOT NULL;
