-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('MONTHLY', 'WEEKLY', 'YEARLY');

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'ADJUSTMENT';

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "closing_day" INTEGER,
ADD COLUMN     "due_day" INTEGER;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "original_transaction_id" TEXT;
