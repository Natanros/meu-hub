-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "installments" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "recurrence" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "recurrenceCount" INTEGER;
