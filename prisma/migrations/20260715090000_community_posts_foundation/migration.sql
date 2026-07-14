-- Phase 2 Part 1 community foundation. Additive only; no existing objects are altered or removed.
CREATE TYPE "CommunityPostType" AS ENUM ('LOST_ITEM','FOUND_ITEM','MISSING_PET','LOST_DOCUMENT','FOUND_DOCUMENT','VEHICLE','NEED_HELP','RECOVERED_ITEM','SUCCESS_STORY','COMMUNITY_UPDATE');
CREATE TYPE "CommunityItemCategory" AS ENUM ('MOBILE','WALLET','KEYS','DOCUMENTS','BAG','PET','VEHICLE','ELECTRONICS','JEWELLERY','CLOTHING','OTHER');
CREATE TYPE "CommunityPostStatus" AS ENUM ('DRAFT','PUBLISHED','CLAIM_PENDING','VERIFICATION_PENDING','RECOVERED','CLOSED','HIDDEN','REMOVED');
CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC','FOLLOWERS_ONLY','PRIVATE','UNLISTED');
CREATE TYPE "CommunityContactPreference" AS ENUM ('PLATFORM_MESSAGE','COMMENTS','BOTH','NO_DIRECT_CONTACT');
CREATE TYPE "CommunityModerationStatus" AS ENUM ('PENDING','APPROVED','FLAGGED','REJECTED','AUTO_HIDDEN');
CREATE TYPE "PostMediaType" AS ENUM ('IMAGE','VIDEO');
CREATE TYPE "PostMediaProcessingStatus" AS ENUM ('UPLOADING','PROCESSING','READY','FAILED','REMOVED');

CREATE TABLE "CommunityPost" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "postType" "CommunityPostType" NOT NULL,
  "itemCategory" "CommunityItemCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "CommunityPostStatus" NOT NULL DEFAULT 'DRAFT',
  "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
  "rewardOffered" BOOLEAN NOT NULL DEFAULT false,
  "rewardAmount" DECIMAL(10,2),
  "rewardCurrency" TEXT NOT NULL DEFAULT 'INR',
  "eventDate" TIMESTAMP(3),
  "publicLocationName" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "postalCode" TEXT,
  "publicLatitude" DECIMAL(9,6),
  "publicLongitude" DECIMAL(9,6),
  "privateLatitude" DECIMAL(9,6),
  "privateLongitude" DECIMAL(9,6),
  "contactPreference" "CommunityContactPreference" NOT NULL DEFAULT 'PLATFORM_MESSAGE',
  "allowComments" BOOLEAN NOT NULL DEFAULT true,
  "allowSharing" BOOLEAN NOT NULL DEFAULT true,
  "isVerifiedPost" BOOLEAN NOT NULL DEFAULT false,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "moderationStatus" "CommunityModerationStatus" NOT NULL DEFAULT 'APPROVED',
  "moderationReason" TEXT,
  "reactionCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "shareCount" INTEGER NOT NULL DEFAULT 0,
  "saveCount" INTEGER NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "recoveredAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostMedia" (
  "id" TEXT NOT NULL,
  "postId" TEXT,
  "ownerId" TEXT NOT NULL,
  "mediaType" "PostMediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "storageKey" TEXT,
  "thumbnailUrl" TEXT,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "duration" INTEGER,
  "altText" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "processingStatus" "PostMediaProcessingStatus" NOT NULL DEFAULT 'READY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityTag" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityPostTag" (
  "postId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "CommunityPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

CREATE UNIQUE INDEX "CommunityTag_slug_key" ON "CommunityTag"("slug");
CREATE INDEX "CommunityPost_authorId_createdAt_idx" ON "CommunityPost"("authorId","createdAt");
CREATE INDEX "CommunityPost_status_visibility_moderationStatus_publishedAt_id_idx" ON "CommunityPost"("status","visibility","moderationStatus","publishedAt","id");
CREATE INDEX "CommunityPost_postType_publishedAt_idx" ON "CommunityPost"("postType","publishedAt");
CREATE INDEX "CommunityPost_itemCategory_publishedAt_idx" ON "CommunityPost"("itemCategory","publishedAt");
CREATE INDEX "CommunityPost_city_state_publishedAt_idx" ON "CommunityPost"("city","state","publishedAt");
CREATE INDEX "CommunityPost_recoveredAt_idx" ON "CommunityPost"("recoveredAt");
CREATE INDEX "CommunityPost_deletedAt_idx" ON "CommunityPost"("deletedAt");
CREATE INDEX "PostMedia_postId_sortOrder_idx" ON "PostMedia"("postId","sortOrder");
CREATE INDEX "PostMedia_ownerId_processingStatus_idx" ON "PostMedia"("ownerId","processingStatus");
CREATE INDEX "PostMedia_deletedAt_idx" ON "PostMedia"("deletedAt");
CREATE INDEX "CommunityPostTag_tagId_idx" ON "CommunityPostTag"("tagId");

ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPostTag" ADD CONSTRAINT "CommunityPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPostTag" ADD CONSTRAINT "CommunityPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CommunityTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
