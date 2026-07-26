-- Additive lifecycle and idempotency support for item/community integration.
ALTER TYPE "ItemStatus" ADD VALUE IF NOT EXISTS 'MISSING';

ALTER TABLE "Item"
  ADD COLUMN "clientRequestId" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Item_clientRequestId_key" ON "Item"("clientRequestId");
CREATE INDEX "Item_deletedAt_idx" ON "Item"("deletedAt");
