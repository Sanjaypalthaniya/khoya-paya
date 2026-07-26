-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('CLAIM_FOUND_ITEM', 'FOUND_LOST_ITEM', 'MISSING_PET_SIGHTING', 'DOCUMENT_OWNERSHIP_CLAIM', 'VEHICLE_OWNERSHIP_CLAIM', 'HELPFUL_LEAD');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_MORE_INFORMATION', 'VERIFICATION_PENDING', 'VERIFIED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'RETURN_ARRANGEMENT_PENDING', 'RETURN_ARRANGED', 'HANDOVER_PENDING', 'RETURNED', 'RECOVERY_CONFIRMED', 'DISPUTED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClaimAnswerType" AS ENUM ('SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'MULTIPLE_CHOICE', 'BOOLEAN', 'DATE', 'COLOR', 'PARTIAL_IDENTIFIER', 'IMAGE_PROOF');

-- CreateEnum
CREATE TYPE "ClaimAnswerReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimEvidenceType" AS ENUM ('IMAGE', 'DOCUMENT', 'RECEIPT', 'PET_PHOTO', 'PRODUCT_BOX', 'OWNERSHIP_SCREENSHOT', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimEvidenceVisibility" AS ENUM ('PARTICIPANTS', 'ADMIN_ONLY');

-- CreateEnum
CREATE TYPE "ReturnArrangementStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RewardPromiseStatus" AS ENUM ('NOT_OFFERED', 'PROMISED', 'ACKNOWLEDGED', 'WAIVED', 'FULFILLED_OUTSIDE_PLATFORM', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "RecoveryDisputeReason" AS ENUM ('WRONG_ITEM', 'FALSE_CLAIM', 'ITEM_NOT_RETURNED', 'REWARD_DISAGREEMENT', 'HARASSMENT', 'UNSAFE_MEETUP', 'FRAUD_OR_PAYMENT_REQUEST', 'DAMAGED_ITEM', 'IDENTITY_MISMATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "RecoveryDisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'RESOLVED', 'DISMISSED', 'ACTION_TAKEN');

-- CreateEnum
CREATE TYPE "RecoveryDisputePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "ClaimRequest" (
    "id" TEXT NOT NULL,
    "publicClaimId" TEXT NOT NULL,
    "clientRequestId" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "postId" TEXT NOT NULL,
    "itemId" TEXT,
    "requesterId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "conversationId" TEXT,
    "publicMessage" TEXT NOT NULL,
    "privateMessageCipher" TEXT,
    "approximateLocation" TEXT,
    "eventDate" TIMESTAMP(3),
    "contactPreference" TEXT NOT NULL DEFAULT 'PLATFORM_MESSAGE',
    "verificationScore" INTEGER NOT NULL DEFAULT 0,
    "verificationDecision" TEXT,
    "verificationReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "returnArrangedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "recoveredAt" TIMESTAMP(3),
    "disputedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimVerificationQuestion" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "questionCode" TEXT,
    "questionText" TEXT NOT NULL,
    "answerType" "ClaimAnswerType" NOT NULL,
    "isSensitive" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "verificationWeight" INTEGER NOT NULL DEFAULT 10,
    "createdById" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimVerificationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimVerificationAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answeredById" TEXT NOT NULL,
    "answerCipher" TEXT NOT NULL,
    "answerHash" TEXT,
    "reviewStatus" "ClaimAnswerReviewStatus" NOT NULL DEFAULT 'PENDING',
    "scoreAwarded" INTEGER NOT NULL DEFAULT 0,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimVerificationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimEvidence" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "evidenceType" "ClaimEvidenceType" NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "moderationStatus" "CommunityModerationStatus" NOT NULL DEFAULT 'PENDING',
    "visibility" "ClaimEvidenceVisibility" NOT NULL DEFAULT 'PARTICIPANTS',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimActivity" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimReturnArrangement" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "status" "ReturnArrangementStatus" NOT NULL DEFAULT 'PROPOSED',
    "proposedById" TEXT NOT NULL,
    "approximatePlace" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "safetyAcknowledgedByRequesterAt" TIMESTAMP(3),
    "safetyAcknowledgedByRecipientAt" TIMESTAMP(3),
    "handoverCodeHash" TEXT,
    "handoverCodeExpiresAt" TIMESTAMP(3),
    "handoverAttempts" INTEGER NOT NULL DEFAULT 0,
    "requesterConfirmedAt" TIMESTAMP(3),
    "recipientConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimReturnArrangement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardPromise" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "promisedById" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "RewardPromiseStatus" NOT NULL DEFAULT 'NOT_OFFERED',
    "note" TEXT,
    "acknowledgedByRecipientAt" TIMESTAMP(3),
    "fulfilledOutsidePlatformAt" TIMESTAMP(3),
    "waivedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "disputedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardPromise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimSuccessConsent" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "requesterConsent" BOOLEAN,
    "recipientConsent" BOOLEAN,
    "requesterAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "recipientAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "allowCity" BOOLEAN NOT NULL DEFAULT false,
    "allowApprovedPhoto" BOOLEAN NOT NULL DEFAULT false,
    "successPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClaimSuccessConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecoveryDispute" (
    "id" TEXT NOT NULL,
    "publicDisputeId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "reason" "RecoveryDisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RecoveryDisputeStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "RecoveryDisputePriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedAdminId" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryDispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimRequest_publicClaimId_key" ON "ClaimRequest"("publicClaimId");

-- CreateIndex
CREATE INDEX "ClaimRequest_requesterId_status_updatedAt_idx" ON "ClaimRequest"("requesterId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ClaimRequest_recipientId_status_updatedAt_idx" ON "ClaimRequest"("recipientId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ClaimRequest_postId_status_idx" ON "ClaimRequest"("postId", "status");

-- CreateIndex
CREATE INDEX "ClaimRequest_itemId_status_idx" ON "ClaimRequest"("itemId", "status");

-- CreateIndex
CREATE INDEX "ClaimRequest_expiresAt_idx" ON "ClaimRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimRequest_requesterId_clientRequestId_key" ON "ClaimRequest"("requesterId", "clientRequestId");

-- CreateIndex
CREATE INDEX "ClaimVerificationQuestion_claimId_sortOrder_idx" ON "ClaimVerificationQuestion"("claimId", "sortOrder");

-- CreateIndex
CREATE INDEX "ClaimVerificationAnswer_answeredById_createdAt_idx" ON "ClaimVerificationAnswer"("answeredById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimVerificationAnswer_questionId_answeredById_key" ON "ClaimVerificationAnswer"("questionId", "answeredById");

-- CreateIndex
CREATE INDEX "ClaimEvidence_claimId_createdAt_idx" ON "ClaimEvidence"("claimId", "createdAt");

-- CreateIndex
CREATE INDEX "ClaimEvidence_uploadedById_createdAt_idx" ON "ClaimEvidence"("uploadedById", "createdAt");

-- CreateIndex
CREATE INDEX "ClaimActivity_claimId_createdAt_idx" ON "ClaimActivity"("claimId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimReturnArrangement_claimId_key" ON "ClaimReturnArrangement"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardPromise_claimId_key" ON "RewardPromise"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimSuccessConsent_claimId_key" ON "ClaimSuccessConsent"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimSuccessConsent_successPostId_key" ON "ClaimSuccessConsent"("successPostId");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDispute_publicDisputeId_key" ON "RecoveryDispute"("publicDisputeId");

-- CreateIndex
CREATE INDEX "RecoveryDispute_status_priority_createdAt_idx" ON "RecoveryDispute"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "RecoveryDispute_claimId_createdAt_idx" ON "RecoveryDispute"("claimId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryDispute_claimId_openedById_reason_status_key" ON "RecoveryDispute"("claimId", "openedById", "reason", "status");

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimRequest" ADD CONSTRAINT "ClaimRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimVerificationQuestion" ADD CONSTRAINT "ClaimVerificationQuestion_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimVerificationAnswer" ADD CONSTRAINT "ClaimVerificationAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ClaimVerificationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEvidence" ADD CONSTRAINT "ClaimEvidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimActivity" ADD CONSTRAINT "ClaimActivity_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimReturnArrangement" ADD CONSTRAINT "ClaimReturnArrangement_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPromise" ADD CONSTRAINT "RewardPromise_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimSuccessConsent" ADD CONSTRAINT "ClaimSuccessConsent_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryDispute" ADD CONSTRAINT "RecoveryDispute_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
