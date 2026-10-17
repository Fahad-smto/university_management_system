/*
  Warnings:

  - You are about to drop the column `moderatorId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `moderatorId` on the `notices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_moderatorId_fkey";

-- DropForeignKey
ALTER TABLE "notices" DROP CONSTRAINT "notices_moderatorId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "moderatorId",
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "notices" DROP COLUMN "moderatorId",
ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
