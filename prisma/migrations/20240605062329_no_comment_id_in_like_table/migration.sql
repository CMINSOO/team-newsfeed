/*
  Warnings:

  - You are about to drop the column `commentId` on the `Like` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_commentId_fkey`;

-- AlterTable
ALTER TABLE `Like` DROP COLUMN `commentId`;
