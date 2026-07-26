ALTER TABLE "User" ADD COLUMN "moderationStrikeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "postingRestrictedUntil" TIMESTAMP(3);
CREATE INDEX "User_postingRestrictedUntil_idx" ON "User"("postingRestrictedUntil");
