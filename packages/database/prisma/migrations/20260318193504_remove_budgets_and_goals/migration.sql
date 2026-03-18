/*
  Warnings:

  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `goal_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `budgets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_category_id_fkey";

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_goal_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon",
ADD COLUMN     "description" VARCHAR(255);

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "goal_id";

-- DropTable
DROP TABLE "budgets";

-- DropTable
DROP TABLE "goals";

-- DropEnum
DROP TYPE "BudgetPeriod";
