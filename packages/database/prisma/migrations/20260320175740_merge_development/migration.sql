-- CreateEnum
CREATE TYPE "AccountOwnership" AS ENUM ('PERSONAL', 'BUSINESS');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "bank_name" VARCHAR(100),
ADD COLUMN     "cnpj" VARCHAR(18),
ADD COLUMN     "cpf" VARCHAR(14),
ADD COLUMN     "ownership" "AccountOwnership" NOT NULL DEFAULT 'PERSONAL';
