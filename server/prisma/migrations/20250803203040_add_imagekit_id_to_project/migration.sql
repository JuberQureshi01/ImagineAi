/*
  Warnings:

  - Added the required column `imagekitId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "imagekitId" TEXT NOT NULL;
