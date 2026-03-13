/*
  Warnings:

  - You are about to drop the `transaction_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transaction_tags" DROP CONSTRAINT "transaction_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_tags" DROP CONSTRAINT "transaction_tags_transaction_id_fkey";

-- DropTable
DROP TABLE "transaction_tags";

-- CreateTable
CREATE TABLE "_transaction_tags" (
    "transaction_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "_transaction_tags_pkey" PRIMARY KEY ("transaction_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "_transaction_tags" ADD CONSTRAINT "_transaction_tags_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_transaction_tags" ADD CONSTRAINT "_transaction_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
