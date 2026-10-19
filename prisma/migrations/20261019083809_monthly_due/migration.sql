/*
  Warnings:

  - You are about to drop the `Due` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MonthlyDueToPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MonthlyDueToPayment" DROP CONSTRAINT "_MonthlyDueToPayment_A_fkey";

-- DropForeignKey
ALTER TABLE "_MonthlyDueToPayment" DROP CONSTRAINT "_MonthlyDueToPayment_B_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_dueId_fkey";

-- DropTable
DROP TABLE "Due";

-- DropTable
DROP TABLE "_MonthlyDueToPayment";

-- CreateTable
CREATE TABLE "_PaymentMonthlyDues" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PaymentMonthlyDues_AB_unique" ON "_PaymentMonthlyDues"("A", "B");

-- CreateIndex
CREATE INDEX "_PaymentMonthlyDues_B_index" ON "_PaymentMonthlyDues"("B");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_dueId_fkey" FOREIGN KEY ("dueId") REFERENCES "monthly_dues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMonthlyDues" ADD CONSTRAINT "_PaymentMonthlyDues_A_fkey" FOREIGN KEY ("A") REFERENCES "monthly_dues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMonthlyDues" ADD CONSTRAINT "_PaymentMonthlyDues_B_fkey" FOREIGN KEY ("B") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
