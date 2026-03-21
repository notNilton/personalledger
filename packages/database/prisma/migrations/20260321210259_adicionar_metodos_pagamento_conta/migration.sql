-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "has_credit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_debit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "has_pix" BOOLEAN NOT NULL DEFAULT true;
