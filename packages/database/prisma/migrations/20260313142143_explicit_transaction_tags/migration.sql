/*
  Warnings:

  - You are about to drop the `_TagToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TagToTransaction" DROP CONSTRAINT "_TagToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToTransaction" DROP CONSTRAINT "_TagToTransaction_B_fkey";

-- DropTable
DROP TABLE "_TagToTransaction";

-- CreateTable
CREATE TABLE "transaction_tags" (
    "transaction_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "transaction_tags_pkey" PRIMARY KEY ("transaction_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
