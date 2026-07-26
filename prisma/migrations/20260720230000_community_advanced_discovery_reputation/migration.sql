-- CreateEnum
CREATE TYPE "LocationPrecision" AS ENUM ('COUNTRY', 'STATE', 'CITY', 'AREA', 'APPROXIMATE', 'EXACT_PRIVATE');

-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('NEW_MEMBER', 'ACTIVE_MEMBER', 'TRUSTED_HELPER', 'COMMUNITY_CHAMPION', 'COMMUNITY_HERO');

-- CreateEnum
CREATE TYPE "CommunityPointStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REVERSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('ACTIVITY', 'TRUST', 'ACHIEVEMENT', 'MEMBERSHIP', 'VERIFICATION', 'ORGANIZATION', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "BadgeCriteriaType" AS ENUM ('POINTS', 'TRUST_SCORE', 'VERIFIED_RETURNS', 'HELPFUL_COMMENTS', 'PROFILE_COMPLETE', 'MANUAL');

-- CreateEnum
CREATE TYPE "LeaderboardType" AS ENUM ('TOP_HELPERS', 'VERIFIED_RETURNS', 'TRUST_SCORE', 'HELPFUL_CONTRIBUTORS', 'COMMUNITY_HERO', 'TOP_ORGANIZATIONS');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "LeaderboardLocationScope" AS ENUM ('CITY', 'STATE', 'COUNTRY', 'GLOBAL');

-- CreateEnum
CREATE TYPE "RecommendationTargetType" AS ENUM ('POST', 'USER');

-- CreateEnum
CREATE TYPE "RecommendationDismissalReason" AS ENUM ('NOT_RELEVANT', 'ALREADY_SEEN', 'WRONG_LOCATION', 'WRONG_CATEGORY', 'DO_NOT_SHOW_USER', 'OTHER');

-- AlterTable
ALTER TABLE "CommunityPost" ADD COLUMN     "locationPrecision" "LocationPrecision" NOT NULL DEFAULT 'CITY',
ADD COLUMN     "trendingCalculatedAt" TIMESTAMP(3),
ADD COLUMN     "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leaderboardOptOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicCity" TEXT,
ADD COLUMN     "publicCountry" TEXT,
ADD COLUMN     "publicState" TEXT;

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchAggregate" (
    "id" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "lastSearchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "trustLevel" "TrustLevel" NOT NULL DEFAULT 'NEW_MEMBER',
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "successfulReturns" INTEGER NOT NULL DEFAULT 0,
    "verifiedReturns" INTEGER NOT NULL DEFAULT 0,
    "helpfulComments" INTEGER NOT NULL DEFAULT 0,
    "validReports" INTEGER NOT NULL DEFAULT 0,
    "accountAgeScore" INTEGER NOT NULL DEFAULT 0,
    "profileCompletionScore" INTEGER NOT NULL DEFAULT 0,
    "verificationScore" INTEGER NOT NULL DEFAULT 0,
    "moderationPenalty" INTEGER NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPointLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "reason" TEXT NOT NULL,
    "status" "CommunityPointStatus" NOT NULL DEFAULT 'CONFIRMED',
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedAt" TIMESTAMP(3),

    CONSTRAINT "CommunityPointLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "BadgeCategory" NOT NULL,
    "criteriaType" "BadgeCriteriaType" NOT NULL,
    "criteriaValue" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedBy" TEXT,
    "reason" TEXT NOT NULL,
    "referenceId" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AchievementDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leaderboardType" "LeaderboardType" NOT NULL,
    "periodType" "LeaderboardPeriod" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "locationScope" "LeaderboardLocationScope" NOT NULL DEFAULT 'GLOBAL',
    "locationValue" TEXT NOT NULL DEFAULT '',
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "RecommendationTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "RecommendationDismissalReason" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RecommendationDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchHistory_userId_createdAt_idx" ON "SearchHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchAggregate_periodKey_searchCount_idx" ON "SearchAggregate"("periodKey", "searchCount");

-- CreateIndex
CREATE UNIQUE INDEX "SearchAggregate_normalizedQuery_periodKey_city_country_key" ON "SearchAggregate"("normalizedQuery", "periodKey", "city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "TrustProfile_userId_key" ON "TrustProfile"("userId");

-- CreateIndex
CREATE INDEX "TrustProfile_trustScore_idx" ON "TrustProfile"("trustScore");

-- CreateIndex
CREATE INDEX "TrustProfile_trustLevel_idx" ON "TrustProfile"("trustLevel");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPointLedger_idempotencyKey_key" ON "CommunityPointLedger"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CommunityPointLedger_userId_status_createdAt_idx" ON "CommunityPointLedger"("userId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BadgeDefinition_code_key" ON "BadgeDefinition"("code");

-- CreateIndex
CREATE INDEX "UserBadge_userId_awardedAt_idx" ON "UserBadge"("userId", "awardedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementDefinition_code_key" ON "AchievementDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_leaderboardType_periodType_periodKey_lo_idx" ON "LeaderboardSnapshot"("leaderboardType", "periodType", "periodKey", "locationScope", "locationValue", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardSnapshot_userId_leaderboardType_periodType_perio_key" ON "LeaderboardSnapshot"("userId", "leaderboardType", "periodType", "periodKey", "locationScope", "locationValue");

-- CreateIndex
CREATE INDEX "RecommendationDismissal_userId_expiresAt_idx" ON "RecommendationDismissal"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationDismissal_userId_targetType_targetId_key" ON "RecommendationDismissal"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "CommunityPost_trendingScore_publishedAt_idx" ON "CommunityPost"("trendingScore", "publishedAt");

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustProfile" ADD CONSTRAINT "TrustProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPointLedger" ADD CONSTRAINT "CommunityPointLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "BadgeDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "AchievementDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardSnapshot" ADD CONSTRAINT "LeaderboardSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationDismissal" ADD CONSTRAINT "RecommendationDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
