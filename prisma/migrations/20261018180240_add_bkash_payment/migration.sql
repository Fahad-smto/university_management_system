/*
  Warnings:

  - You are about to drop the column `dueId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bkashPaymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_dueId_fkey";

-- DropIndex
DROP INDEX "payments_dueId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "dueId",
ADD COLUMN     "bkashPaymentId" TEXT;

-- CreateTable
CREATE TABLE "_MonthlyDueToPayment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MonthlyDueToPayment_AB_unique" ON "_MonthlyDueToPayment"("A", "B");

-- CreateIndex
CREATE INDEX "_MonthlyDueToPayment_B_index" ON "_MonthlyDueToPayment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bkashPaymentId_key" ON "payments"("bkashPaymentId");

-- AddForeignKey
ALTER TABLE "_MonthlyDueToPayment" ADD CONSTRAINT "_MonthlyDueToPayment_A_fkey" FOREIGN KEY ("A") REFERENCES "monthly_dues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MonthlyDueToPayment" ADD CONSTRAINT "_MonthlyDueToPayment_B_fkey" FOREIGN KEY ("B") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
