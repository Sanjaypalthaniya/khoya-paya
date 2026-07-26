import { randomBytes, randomInt } from "crypto";
import bcrypt from "bcryptjs";
import {
  Prisma,
  type ClaimStatus,
  type ClaimType,
  type UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { awardPoints } from "@/lib/community/reputation";
import {
  encryptClaimSecret,
  decryptClaimSecret,
  hashClaimAnswer,
} from "./encryption";
import { assertClaimTransition, nextClaimAction } from "./state-machine";
import { questionsForCategory } from "./templates";
const active: ClaimStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_MORE_INFORMATION",
  "VERIFICATION_PENDING",
  "VERIFIED",
  "RETURN_ARRANGEMENT_PENDING",
  "RETURN_ARRANGED",
  "HANDOVER_PENDING",
  "RETURNED",
  "DISPUTED",
];
const claimInclude = {
  post: {
    select: {
      id: true,
      title: true,
      postType: true,
      itemCategory: true,
      status: true,
      publicLocationName: true,
      city: true,
    },
  },
  requester: {
    select: { id: true, name: true, verificationLevel: true, trustScore: true },
  },
  recipient: {
    select: { id: true, name: true, verificationLevel: true, trustScore: true },
  },
  questions: {
    orderBy: { sortOrder: "asc" as const },
    include: { answers: true },
  },
  evidence: {
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" as const },
  },
  activities: { orderBy: { createdAt: "asc" as const } },
  returnArrangement: true,
  rewardPromise: true,
  disputes: { orderBy: { createdAt: "desc" as const } },
  successConsent: true,
  conversation: { select: { id: true, finderAccessToken: true } },
} satisfies Prisma.ClaimRequestInclude;
type ClaimRecord = Prisma.ClaimRequestGetPayload<{
  include: typeof claimInclude;
}>;
function publicId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}
function activity(
  type: string,
  title: string,
  description: string,
  actorId?: string,
) {
  return { type, title, description, actorId };
}
export function toClaimSummary(claim: ClaimRecord, viewerId: string) {
  return {
    id: claim.id,
    publicClaimId: claim.publicClaimId,
    claimType: claim.claimType,
    status: claim.status,
    post: claim.post,
    otherParticipant:
      claim.requesterId === viewerId ? claim.recipient : claim.requester,
    submittedAt: claim.submittedAt?.toISOString() ?? null,
    updatedAt: claim.updatedAt.toISOString(),
    nextAction: nextClaimAction(claim.status, claim.requesterId === viewerId),
    hasOpenDispute: claim.disputes.some((d) =>
      ["OPEN", "UNDER_REVIEW", "NEEDS_INFORMATION"].includes(d.status),
    ),
  };
}
export function toParticipantClaim(
  claim: ClaimRecord,
  viewerId: string,
  role: UserRole,
) {
  const participant =
    role === "ADMIN" ||
    claim.requesterId === viewerId ||
    claim.recipientId === viewerId;
  if (!participant) throw new Error("Claim not found.");
  return {
    ...toClaimSummary(claim, viewerId),
    publicMessage: claim.publicMessage,
    privateMessage: claim.privateMessageCipher
      ? decryptClaimSecret(claim.privateMessageCipher)
      : null,
    approximateLocation: claim.approximateLocation,
    eventDate: claim.eventDate?.toISOString() ?? null,
    requester: claim.requester,
    recipient: claim.recipient,
    questions: claim.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      answerType: q.answerType,
      isRequired: q.isRequired,
      reviewStatus: q.answers[0]?.reviewStatus ?? null,
      answer: q.answers[0]
        ? decryptClaimSecret(q.answers[0].answerCipher)
        : null,
      scoreAwarded: q.answers[0]?.scoreAwarded ?? 0,
    })),
    evidence: claim.evidence.filter((e) => e.visibility === "PARTICIPANTS" || role === "ADMIN" || e.uploadedById === viewerId).map((e) => ({
      id: e.id,
      evidenceType: e.evidenceType,
      description: e.description,
      url: e.url,
      mimeType: e.mimeType,
      fileSize: e.fileSize,
      moderationStatus: e.moderationStatus,
      createdAt: e.createdAt.toISOString(),
    })),
    timeline: claim.activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      createdAt: a.createdAt.toISOString(),
    })),
    returnArrangement: claim.returnArrangement
      ? {
          status: claim.returnArrangement.status,
          approximatePlace: claim.returnArrangement.approximatePlace,
          scheduledAt: claim.returnArrangement.scheduledAt.toISOString(),
          requesterConfirmed: Boolean(
            claim.returnArrangement.requesterConfirmedAt,
          ),
          recipientConfirmed: Boolean(
            claim.returnArrangement.recipientConfirmedAt,
          ),
        }
      : null,
    reward: claim.rewardPromise
      ? {
          status: claim.rewardPromise.status,
          amount: claim.rewardPromise.amount?.toString() ?? null,
          currency: claim.rewardPromise.currency,
          note: claim.rewardPromise.note,
        }
      : null,
    disputes: claim.disputes.map((d) => ({
      id: d.id,
      publicDisputeId: d.publicDisputeId,
      reason: d.reason,
      status: d.status,
      priority: d.priority,
      createdAt: d.createdAt.toISOString(),
    })),
    successConsent: claim.successConsent && {
      requesterConsent: claim.successConsent.requesterConsent,
      recipientConsent: claim.successConsent.recipientConsent,
      requesterAnonymous: claim.successConsent.requesterAnonymous,
      recipientAnonymous: claim.successConsent.recipientAnonymous,
      allowCity: claim.successConsent.allowCity,
      allowApprovedPhoto: claim.successConsent.allowApprovedPhoto,
    },
    secureConversationUrl: claim.conversation
      ? claim.recipientId === viewerId
        ? `/dashboard/chats/${claim.conversation.id}`
        : `/chat/finder/${claim.conversation.finderAccessToken}`
      : null,
  };
}
export async function createClaim(
  requesterId: string,
  input: {
    postId: string;
    claimType: ClaimType;
    publicMessage: string;
    privateMessage?: string;
    approximateLocation?: string;
    eventDate?: Date;
    contactPreference?: string;
    clientRequestId: string;
  },
) {
  if (/@|\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/i.test(input.publicMessage))
    throw new Error("Public claim summaries cannot contain email addresses or phone numbers.");
  const post = await prisma.communityPost.findFirst({
    where: {
      id: input.postId,
      deletedAt: null,
      status: { in: ["PUBLISHED", "CLAIM_PENDING", "VERIFICATION_PENDING"] },
      moderationStatus: "APPROVED",
      postType: {
        in: [
          "LOST_ITEM",
          "FOUND_ITEM",
          "MISSING_PET",
          "LOST_DOCUMENT",
          "FOUND_DOCUMENT",
          "VEHICLE",
        ],
      },
    },
    include: { item: true, author: { select: { id: true, isBlocked: true } } },
  });
  if (!post) throw new Error("This post cannot accept claims.");
  if (post.authorId === requesterId)
    throw new Error("You cannot claim your own post.");
  if (post.author.isBlocked || post.item?.status === "RECOVERED")
    throw new Error("This item cannot accept new claims.");
  const existing = await prisma.claimRequest.findFirst({
    where: {
      requesterId,
      postId: input.postId,
      status: { in: active },
      deletedAt: null,
    },
    include: claimInclude,
  });
  if (existing) return toClaimSummary(existing, requesterId);
  const questions = questionsForCategory(
    post.itemCategory,
    `${post.title}\n${post.description}`,
  );
  const created = await prisma.$transaction(async (tx) => {
    const conversation = post.itemId
      ? await tx.conversation.create({
          data: {
            itemId: post.itemId,
            ownerId: post.authorId,
            finderAccessToken: randomBytes(32).toString("hex"),
            status: "OPEN",
            verificationStatus: "QUESTIONS_SENT",
            lastMessageAt: new Date(),
            messages: {
              create: {
                senderType: "SYSTEM",
                message: "A private claim conversation was opened. Do not share phone numbers, passwords, OTPs, PINs, or exact home addresses.",
                isReadByOwner: false,
              },
            },
          },
        })
      : null;
    return tx.claimRequest.create({
      data: {
        publicClaimId: publicId("CLM"),
        clientRequestId: input.clientRequestId,
        claimType: input.claimType,
        status:
          input.claimType === "HELPFUL_LEAD"
            ? "SUBMITTED"
            : "VERIFICATION_PENDING",
        postId: post.id,
        itemId: post.itemId,
        requesterId,
        recipientId: post.authorId,
        conversationId: conversation?.id,
        publicMessage: input.publicMessage,
        privateMessageCipher: input.privateMessage
          ? encryptClaimSecret(input.privateMessage)
          : null,
        approximateLocation: input.approximateLocation,
        eventDate: input.eventDate,
        contactPreference: input.contactPreference ?? "PLATFORM_MESSAGE",
        submittedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 864e5),
        questions: {
          create: questions.map((q, index) => ({
            questionCode: q.code,
            questionText: q.text,
            answerType: q.answerType,
            verificationWeight: q.weight,
            createdById: post.authorId,
            sortOrder: index,
          })),
        },
        activities: {
          create: activity(
            "CLAIM_SUBMITTED",
            "Claim submitted",
            "A private recovery claim was submitted for review.",
            requesterId,
          ),
        },
      },
      include: claimInclude,
    });
  });
  return toClaimSummary(created, requesterId);
}
export async function listClaims(userId: string, filter?: ClaimStatus) {
  return (
    await prisma.claimRequest.findMany({
      where: {
        deletedAt: null,
        OR: [{ requesterId: userId }, { recipientId: userId }],
        ...(filter ? { status: filter } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: claimInclude,
    })
  ).map((c) => toClaimSummary(c, userId));
}
export async function getClaim(
  claimId: string,
  userId: string,
  role: UserRole,
) {
  const claim = await prisma.claimRequest.findFirst({
    where: {
      OR: [{ id: claimId }, { publicClaimId: claimId }],
      deletedAt: null,
    },
    include: claimInclude,
  });
  if (!claim) throw new Error("Claim not found.");
  return toParticipantClaim(claim, userId, role);
}
export async function answerQuestions(
  claimId: string,
  userId: string,
  answers: Array<{ questionId: string; answer: string }>,
) {
  const claim = await prisma.claimRequest.findFirst({
    where: {
      id: claimId,
      requesterId: userId,
      status: {
        in: ["SUBMITTED", "VERIFICATION_PENDING", "NEEDS_MORE_INFORMATION"],
      },
    },
    include: { questions: true },
  });
  if (!claim) throw new Error("Claim is not available for answers.");
  const allowed = new Set(claim.questions.map((q) => q.id));
  if (answers.some((a) => !allowed.has(a.questionId)))
    throw new Error("Invalid verification question.");
  await prisma.$transaction(async (tx) => {
    for (const answer of answers)
      await tx.claimVerificationAnswer.upsert({
        where: {
          questionId_answeredById: {
            questionId: answer.questionId,
            answeredById: userId,
          },
        },
        update: {
          answerCipher: encryptClaimSecret(answer.answer),
          answerHash: hashClaimAnswer(answer.answer),
          reviewStatus: "PENDING",
          scoreAwarded: 0,
        },
        create: {
          questionId: answer.questionId,
          answeredById: userId,
          answerCipher: encryptClaimSecret(answer.answer),
          answerHash: hashClaimAnswer(answer.answer),
        },
      });
    await tx.claimRequest.update({
      where: { id: claim.id },
      data: {
        status: "UNDER_REVIEW",
        activities: {
          create: activity(
            "ANSWERS_SUBMITTED",
            "Answers submitted",
            "Private verification answers are ready for review.",
            userId,
          ),
        },
      },
    });
  });
}
export async function transitionClaim(
  claimId: string,
  actor: { id: string; role: UserRole; isBlocked: boolean },
  next: ClaimStatus,
  reason: string,
) {
  const claim = await prisma.claimRequest.findUnique({
    where: { id: claimId },
    include: {
      questions: { include: { answers: true } },
      returnArrangement: true,
      disputes: true,
    },
  });
  if (!claim) throw new Error("Claim not found.");
  const requiredComplete = claim.questions
    .filter((q) => q.isRequired)
    .every((q) => q.answers.some((a) => a.reviewStatus === "ACCEPTED"));
  const bothConfirmed = Boolean(
    claim.returnArrangement?.requesterConfirmedAt &&
    claim.returnArrangement.recipientConfirmedAt,
  );
  const openDispute = claim.disputes.some((d) =>
    ["OPEN", "UNDER_REVIEW", "NEEDS_INFORMATION"].includes(d.status),
  );
  assertClaimTransition({
    current: claim.status,
    next,
    actorId: actor.id,
    role: actor.role,
    requesterId: claim.requesterId,
    recipientId: claim.recipientId,
    blocked: actor.isBlocked,
    requiredAnswersComplete: requiredComplete,
    bothConfirmed,
    hasOpenDispute: openDispute,
  });
  const timestamps: Prisma.ClaimRequestUpdateInput =
    next === "VERIFIED"
      ? {
          verifiedAt: new Date(),
          verificationDecision: "VERIFIED",
          verificationReason: reason,
        }
      : next === "REJECTED"
        ? {
            rejectedAt: new Date(),
            verificationDecision: "REJECTED",
            verificationReason: reason,
          }
        : next === "WITHDRAWN"
          ? { withdrawnAt: new Date() }
          : next === "RECOVERY_CONFIRMED"
            ? { recoveredAt: new Date() }
            : next === "CLOSED"
              ? { closedAt: new Date() }
              : {};
  await prisma.claimRequest.update({
    where: { id: claim.id },
    data: {
      status: next,
      ...timestamps,
      activities: {
        create: activity(next, next.replaceAll("_", " "), reason, actor.id),
      },
    },
  });
  const notifyUserId = actor.id === claim.requesterId ? claim.recipientId : claim.requesterId;
  await createNotification({
    userId: notifyUserId,
    type: "RECOVERY_UPDATE",
    title: `Claim ${next.replaceAll("_", " ").toLowerCase()}`,
    message: reason,
    link: `/dashboard/claims/${claim.id}`,
    metadata: { claimId: claim.id, status: next },
  }).catch(() => null);
  if (next === "RECOVERY_CONFIRMED") await completeRecovery(claim.id);
  return { status: next };
}
async function completeRecovery(claimId: string) {
  const claim = await prisma.claimRequest.findUniqueOrThrow({
    where: { id: claimId },
    include: { disputes: true, post: { select: { itemCategory: true } } },
  });
  if (
    claim.disputes.some((d) =>
      ["OPEN", "UNDER_REVIEW", "NEEDS_INFORMATION"].includes(d.status),
    )
  )
    throw new Error("Recovery is paused by a dispute.");
  const finderId = claim.claimType === "CLAIM_FOUND_ITEM" || claim.claimType === "DOCUMENT_OWNERSHIP_CLAIM" || claim.claimType === "VEHICLE_OWNERSHIP_CLAIM" ? claim.recipientId : claim.requesterId;
  await prisma.$transaction(async (tx) => {
    if (claim.itemId)
      await tx.item.update({
        where: { id: claim.itemId },
        data: { status: "RECOVERED", lostModeEnabled: false },
      });
    await tx.communityPost.update({
      where: { id: claim.postId },
      data: { status: "RECOVERED", recoveredAt: new Date() },
    });
    const consent = await tx.claimSuccessConsent.upsert({
      where: { claimId },
      update: {},
      create: { claimId },
    });
    if (!consent.successPostId) {
      const draft = await tx.communityPost.create({
        data: {
          authorId: claim.recipientId,
          postType: "SUCCESS_STORY",
          itemCategory: claim.post.itemCategory,
          title: "A safe recovery completed",
          description: "A recovery was completed using private verification and a confirmed handover.",
          status: "DRAFT",
          visibility: "PRIVATE",
          moderationStatus: "PENDING",
          contactPreference: "NO_DIRECT_CONTACT",
          allowComments: true,
          allowSharing: true,
        },
      });
      await tx.claimSuccessConsent.update({ where: { claimId }, data: { successPostId: draft.id } });
    }
    await tx.trustProfile.upsert({
      where: { userId: finderId },
      create: { userId: finderId, successfulReturns: 1, verifiedReturns: 1 },
      update: { successfulReturns: { increment: 1 }, verifiedReturns: { increment: 1 } },
    });
  });
  if (finderId !== (claim.claimType === "CLAIM_FOUND_ITEM" ? claim.requesterId : claim.recipientId))
    await awardPoints({
      userId: finderId,
      activityType: "VERIFIED_RETURN",
      points: 100,
      reason: "Verified item recovery",
      idempotencyKey: `claim-recovery:${claim.id}:${finderId}`,
      referenceType: "CLAIM",
      referenceId: claim.id,
    });
}
export async function proposeReturn(
  claimId: string,
  userId: string,
  input: {
    approximatePlace: string;
    scheduledAt: Date;
    safetyAcknowledged: boolean;
  },
) {
  if (!input.safetyAcknowledged)
    throw new Error("Safety acknowledgement is required.");
  const claim = await prisma.claimRequest.findFirst({
    where: {
      id: claimId,
      status: {
        in: ["VERIFIED", "RETURN_ARRANGEMENT_PENDING", "RETURN_ARRANGED"],
      },
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });
  if (!claim) throw new Error("Verified claim not found.");
  await prisma.$transaction(async (tx) => {
    await tx.claimReturnArrangement.upsert({
      where: { claimId },
      update: {
        approximatePlace: input.approximatePlace,
        scheduledAt: input.scheduledAt,
        status: "PROPOSED",
        ...(claim.requesterId === userId
          ? { safetyAcknowledgedByRequesterAt: new Date() }
          : { safetyAcknowledgedByRecipientAt: new Date() }),
      },
      create: {
        claimId,
        proposedById: userId,
        approximatePlace: input.approximatePlace,
        scheduledAt: input.scheduledAt,
        ...(claim.requesterId === userId
          ? { safetyAcknowledgedByRequesterAt: new Date() }
          : { safetyAcknowledgedByRecipientAt: new Date() }),
      },
    });
    await tx.claimRequest.update({
      where: { id: claimId },
      data: {
        status: "RETURN_ARRANGEMENT_PENDING",
        activities: {
          create: activity(
            "RETURN_PROPOSED",
            "Return proposed",
            "A privacy-safe return arrangement was proposed.",
            userId,
          ),
        },
      },
    });
  });
}
export async function generateHandoverCode(claimId: string, userId: string) {
  const claim = await prisma.claimRequest.findFirst({
    where: {
      id: claimId,
      recipientId: userId,
      status: {
        in: [
          "RETURN_ARRANGEMENT_PENDING",
          "RETURN_ARRANGED",
          "HANDOVER_PENDING",
        ],
      },
    },
    include: { returnArrangement: true },
  });
  if (!claim?.returnArrangement)
    throw new Error("Return arrangement not found.");
  if (!claim.returnArrangement.safetyAcknowledgedByRequesterAt || !claim.returnArrangement.safetyAcknowledgedByRecipientAt)
    throw new Error("Both participants must acknowledge the return safety guidance.");
  const code = String(randomInt(100000, 1000000)),
    hash = await bcrypt.hash(code, 12);
  await prisma.$transaction([
    prisma.claimReturnArrangement.update({
      where: { claimId },
      data: {
        handoverCodeHash: hash,
        handoverCodeExpiresAt: new Date(Date.now() + 15 * 60_000),
        handoverAttempts: 0,
        status: "ACCEPTED",
      },
    }),
    prisma.claimRequest.update({
      where: { id: claimId },
      data: {
        status: "HANDOVER_PENDING",
        activities: {
          create: activity(
            "HANDOVER_CODE_GENERATED",
            "Handover code generated",
            "A short-lived handover code was generated.",
            userId,
          ),
        },
      },
    }),
  ]);
  return code;
}
export async function verifyHandoverCode(
  claimId: string,
  userId: string,
  code: string,
) {
  const claim = await prisma.claimRequest.findFirst({
    where: { id: claimId, requesterId: userId, status: "HANDOVER_PENDING" },
    include: { returnArrangement: true },
  });
  const arrangement = claim?.returnArrangement;
  if (
    !arrangement?.handoverCodeHash ||
    !arrangement.handoverCodeExpiresAt ||
    arrangement.handoverCodeExpiresAt < new Date()
  )
    throw new Error("Handover code expired or unavailable.");
  if (arrangement.handoverAttempts >= 5)
    throw new Error("Too many handover attempts.");
  const valid = await bcrypt.compare(code, arrangement.handoverCodeHash);
  await prisma.claimReturnArrangement.update({
    where: { claimId },
    data: {
      handoverAttempts: { increment: 1 },
      ...(valid
        ? {
            requesterConfirmedAt: new Date(),
            handoverCodeHash: null,
            handoverCodeExpiresAt: null,
          }
        : {}),
    },
  });
  if (!valid) throw new Error("Incorrect handover code.");
  return { verified: true };
}
export async function confirmHandover(claimId: string, userId: string) {
  const claim = await prisma.claimRequest.findFirst({
    where: {
      id: claimId,
      status: { in: ["HANDOVER_PENDING", "RETURNED"] },
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    include: { returnArrangement: true },
  });
  if (!claim?.returnArrangement) throw new Error("Handover is not pending.");
  const data =
    claim.requesterId === userId
      ? { requesterConfirmedAt: new Date() }
      : { recipientConfirmedAt: new Date() };
  const arrangement = await prisma.claimReturnArrangement.update({
    where: { claimId },
    data,
  });
  const both = Boolean(
    arrangement.requesterConfirmedAt && arrangement.recipientConfirmedAt,
  );
  await prisma.claimRequest.update({
    where: { id: claimId },
    data: {
      status: both ? "RETURNED" : "HANDOVER_PENDING",
      returnedAt: both ? new Date() : undefined,
      activities: {
        create: activity(
          "HANDOVER_CONFIRMED",
          "Handover confirmation",
          "A participant confirmed the handover.",
          userId,
        ),
      },
    },
  });
  return { bothConfirmed: both };
}
