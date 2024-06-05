/*
  Warnings:

  - You are about to drop the column `commentid` on the `Like` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_commentid_fkey`;

-- AlterTable
ALTER TABLE `Like` DROP COLUMN `commentid`,
    ADD COLUMN `commentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
