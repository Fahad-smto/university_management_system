-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "dueId" TEXT;

-- CreateTable
CREATE TABLE "Due" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Due_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_dueId_fkey" FOREIGN KEY ("dueId") REFERENCES "Due"("id") ON DELETE SET NULL ON UPDATE CASCADE;
