-- CreateEnum
CREATE TYPE "CommunityReactionType" AS ENUM ('LIKE', 'HELPFUL', 'HOPE', 'FOUND_IT', 'CELEBRATE');

-- CreateEnum
CREATE TYPE "CommentReactionType" AS ENUM ('LIKE', 'HELPFUL', 'CELEBRATE');

-- CreateEnum
CREATE TYPE "CommunityCommentStatus" AS ENUM ('ACTIVE', 'EDITED', 'DELETED', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "FollowStatus" AS ENUM ('ACTIVE', 'PENDING', 'BLOCKED', 'REMOVED');

-- CreateEnum
CREATE TYPE "CommunityShareType" AS ENUM ('COPY_LINK', 'NATIVE_SHARE', 'WHATSAPP', 'INTERNAL_SHARE', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunityReportTargetType" AS ENUM ('POST', 'COMMENT', 'USER');

-- CreateEnum
CREATE TYPE "CommunityReportReason" AS ENUM ('SPAM', 'FRAUD', 'WRONG_INFORMATION', 'HARASSMENT', 'UNSAFE_CONTENT', 'DUPLICATE_CONTENT', 'ITEM_ALREADY_RECOVERED', 'IMPERSONATION', 'PRIVACY_VIOLATION', 'SCAM_OR_PAYMENT_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "CommunityReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED', 'ACTION_TAKEN');

-- CreateEnum
CREATE TYPE "CommunityNotificationType" AS ENUM ('POST_REACTION', 'COMMENT_CREATED', 'COMMENT_REPLY', 'COMMENT_REACTION', 'USER_MENTION', 'NEW_FOLLOWER', 'FOLLOW_REQUEST', 'FOLLOW_ACCEPTED', 'POSSIBLE_MATCH', 'SOMEONE_FOUND_ITEM', 'CLAIM_REQUEST', 'VERIFICATION_UPDATE', 'FINDER_MESSAGE', 'QR_SCAN', 'ITEM_RECOVERED', 'POST_SAVED_MILESTONE', 'REPORT_UPDATE', 'ADMIN_UPDATE', 'SECURITY_ALERT');

-- CreateEnum
CREATE TYPE "CommunityActivityType" AS ENUM ('POST_CREATED', 'POST_PUBLISHED', 'POST_UPDATED', 'POST_RECOVERED', 'POST_CLOSED', 'POST_REACTION_ADDED', 'COMMENT_CREATED', 'COMMENT_REPLIED', 'COMMENT_EDITED', 'COMMENT_DELETED', 'COMMENT_REACTION_ADDED', 'POST_SAVED', 'USER_FOLLOWED', 'POST_SHARED', 'REPORT_CREATED');

-- CreateEnum
CREATE TYPE "CommunityActivityVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'INTERNAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followerCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followingCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reactionType" "CommunityReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "rootCommentId" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommunityCommentStatus" NOT NULL DEFAULT 'ACTIVE',
    "depth" INTEGER NOT NULL DEFAULT 0,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "reactionCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" "CommunityModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "moderationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reactionType" "CommentReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "status" "FollowStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityShare" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousSessionHash" TEXT,
    "shareType" "CommunityShareType" NOT NULL,
    "destination" TEXT,
    "dedupeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "CommunityReportTargetType" NOT NULL,
    "targetPostId" TEXT,
    "targetCommentId" TEXT,
    "targetUserId" TEXT,
    "reason" "CommunityReportReason" NOT NULL,
    "details" TEXT,
    "status" "CommunityReportStatus" NOT NULL DEFAULT 'OPEN',
    "assignedAdminId" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityNotification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "CommunityNotificationType" NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "relatedUserId" TEXT,
    "activityId" TEXT,
    "titleKey" TEXT NOT NULL,
    "messageKey" TEXT NOT NULL,
    "metadata" JSONB,
    "dedupeKey" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CommunityNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inAppReactions" BOOLEAN NOT NULL DEFAULT true,
    "inAppComments" BOOLEAN NOT NULL DEFAULT true,
    "inAppReplies" BOOLEAN NOT NULL DEFAULT true,
    "inAppFollows" BOOLEAN NOT NULL DEFAULT true,
    "inAppMentions" BOOLEAN NOT NULL DEFAULT true,
    "inAppItemUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emailCommunity" BOOLEAN NOT NULL DEFAULT false,
    "pushCommunity" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityActivity" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "activityType" "CommunityActivityType" NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "targetUserId" TEXT,
    "metadata" JSONB,
    "visibility" "CommunityActivityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostReaction_postId_reactionType_idx" ON "PostReaction"("postId", "reactionType");

-- CreateIndex
CREATE INDEX "PostReaction_userId_createdAt_idx" ON "PostReaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_userId_key" ON "PostReaction"("postId", "userId");

-- CreateIndex
CREATE INDEX "CommunityComment_postId_parentId_createdAt_id_idx" ON "CommunityComment"("postId", "parentId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "CommunityComment_authorId_createdAt_idx" ON "CommunityComment"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityComment_rootCommentId_idx" ON "CommunityComment"("rootCommentId");

-- CreateIndex
CREATE INDEX "CommentReaction_commentId_reactionType_idx" ON "CommentReaction"("commentId", "reactionType");

-- CreateIndex
CREATE INDEX "CommentReaction_userId_createdAt_idx" ON "CommentReaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_commentId_userId_key" ON "CommentReaction"("commentId", "userId");

-- CreateIndex
CREATE INDEX "SavedPost_userId_createdAt_id_idx" ON "SavedPost"("userId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPost_userId_postId_key" ON "SavedPost"("userId", "postId");

-- CreateIndex
CREATE INDEX "UserFollow_followerId_status_createdAt_idx" ON "UserFollow"("followerId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "UserFollow_followingId_status_createdAt_idx" ON "UserFollow"("followingId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "CommunityShare_postId_createdAt_idx" ON "CommunityShare"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityShare_userId_createdAt_idx" ON "CommunityShare"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityShare_dedupeKey_idx" ON "CommunityShare"("dedupeKey");

-- CreateIndex
CREATE INDEX "CommunityReport_reporterId_createdAt_idx" ON "CommunityReport"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityReport_targetType_status_createdAt_idx" ON "CommunityReport"("targetType", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityReport_targetPostId_idx" ON "CommunityReport"("targetPostId");

-- CreateIndex
CREATE INDEX "CommunityReport_targetCommentId_idx" ON "CommunityReport"("targetCommentId");

-- CreateIndex
CREATE INDEX "CommunityReport_targetUserId_idx" ON "CommunityReport"("targetUserId");

-- CreateIndex
CREATE INDEX "CommunityNotification_recipientId_isRead_createdAt_id_idx" ON "CommunityNotification"("recipientId", "isRead", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityNotification_recipientId_dedupeKey_key" ON "CommunityNotification"("recipientId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "CommunityActivity_actorId_createdAt_id_idx" ON "CommunityActivity"("actorId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "CommunityActivity_postId_createdAt_idx" ON "CommunityActivity"("postId", "createdAt");

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CommunityComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityShare" ADD CONSTRAINT "CommunityShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityShare" ADD CONSTRAINT "CommunityShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_targetPostId_fkey" FOREIGN KEY ("targetPostId") REFERENCES "CommunityPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_targetCommentId_fkey" FOREIGN KEY ("targetCommentId") REFERENCES "CommunityComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityNotification" ADD CONSTRAINT "CommunityNotification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityActivity" ADD CONSTRAINT "CommunityActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityActivity" ADD CONSTRAINT "CommunityActivity_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityActivity" ADD CONSTRAINT "CommunityActivity_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityActivity" ADD CONSTRAINT "CommunityActivity_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "CommunityPost_status_visibility_moderationStatus_publishedAt_id" RENAME TO "CommunityPost_status_visibility_moderationStatus_publishedA_idx";

