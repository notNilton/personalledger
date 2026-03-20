/*
  Warnings:

  - The values [CREDIT_CARD] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `closing_day` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `due_day` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `statement_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `credit_card_statements` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DEBIT', 'CREDIT');

-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('CHECKING', 'SAVINGS', 'CASH', 'WALLET', 'INVESTMENT');
ALTER TABLE "accounts" ALTER COLUMN "type" TYPE "AccountType_new" USING ("type"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "public"."AccountType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "credit_card_statements" DROP CONSTRAINT "credit_card_statements_account_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_statement_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "closing_day",
DROP COLUMN "due_day";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "statement_id",
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'DEBIT';

-- DropTable
DROP TABLE "credit_card_statements";

-- DropEnum
DROP TYPE "StatementStatus";
