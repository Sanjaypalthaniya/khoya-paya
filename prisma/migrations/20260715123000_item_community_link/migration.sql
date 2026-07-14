-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN "itemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPost_itemId_key" ON "CommunityPost"("itemId");

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
