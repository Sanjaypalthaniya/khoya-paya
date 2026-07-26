import { prisma } from "@/lib/prisma";
import { moderateText, textSimilarity, type ModerationResult } from "./engine";
import { SelfHostedMediaModerationProvider } from "./providers";
import { reportServerError } from "@/lib/logger";

export async function moderateSubmission(input: {
  ownerId: string;
  targetType: "POST" | "COMMENT";
  text: string;
  requireRelevance?: boolean;
}): Promise<ModerationResult> {
  const result = moderateText(input);
  const [duplicate, recentCount, user, recentPosts, recentRejections] =
    await Promise.all([
      prisma.moderationCase.findFirst({
        where: {
          ownerId: input.ownerId,
          contentHash: result.contentHash,
          targetType: input.targetType,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) },
        },
        select: { id: true },
      }),
      prisma.moderationCase.count({
        where: {
          ownerId: input.ownerId,
          targetType: input.targetType,
          createdAt: { gte: new Date(Date.now() - 10 * 60_000) },
        },
      }),
      prisma.user.findUnique({
        where: { id: input.ownerId },
        select: { trustScore: true, postingRestrictedUntil: true },
      }),
      input.targetType === "POST"
        ? prisma.communityPost.findMany({
            where: {
              authorId: input.ownerId,
              status: "PUBLISHED",
              deletedAt: null,
              createdAt: { gte: new Date(Date.now() - 30 * 864e5) },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: { title: true, description: true },
          })
        : Promise.resolve([]),
      prisma.moderationCase.count({
        where: {
          ownerId: input.ownerId,
          decision: "REJECTED",
          createdAt: { gte: new Date(Date.now() - 30 * 864e5) },
        },
      }),
    ]);
  let adjusted: ModerationResult = result;
  if (user?.postingRestrictedUntil && user.postingRestrictedUntil > new Date())
    return {
      ...result,
      decision: "REJECTED",
      riskScore: 1,
      reasonCode: "POSTING_RESTRICTED",
      userMessage: `Posting is temporarily restricted until ${user.postingRestrictedUntil.toISOString()}.`,
      signals: ["POSTING_RESTRICTED"],
    };
  const similar =
    input.targetType === "POST" &&
    recentPosts.some(
      (post) =>
        textSimilarity(input.text, `${post.title}\n${post.description}`) >=
        0.65,
    );
  if (
    result.decision === "APPROVED" &&
    (duplicate || similar || recentCount >= 6)
  )
    adjusted = {
      ...result,
      decision: "UNDER_REVIEW",
      riskScore: 0.75,
      reasonCode: duplicate || similar ? "DUPLICATE_CONTENT" : "MASS_POSTING",
      userMessage:
        duplicate || similar
          ? "A very similar item report already exists. Review existing reports before continuing."
          : "This submission is under review because it resembles repeated activity.",
      signals: [duplicate || similar ? "DUPLICATE_CONTENT" : "MASS_POSTING"],
    };
  if (recentRejections >= 3) {
    const until = new Date(Date.now() + 24 * 60 * 60_000);
    await prisma.user.update({
      where: { id: input.ownerId },
      data: {
        moderationStrikeCount: { increment: 1 },
        postingRestrictedUntil: until,
      },
    });
    return {
      ...adjusted,
      decision: "REJECTED",
      riskScore: 1,
      reasonCode: "REPEATED_VIOLATIONS",
      userMessage: `Posting is temporarily restricted until ${until.toISOString()}.`,
      signals: [...new Set([...adjusted.signals, "REPEATED_VIOLATIONS"])],
    };
  }
  if (
    adjusted.decision === "UNDER_REVIEW" &&
    (user?.trustScore ?? 0) >= 80 &&
    adjusted.riskScore < 0.65 &&
    !adjusted.signals.includes("SUSPICIOUS_LINKS")
  )
    adjusted = {
      ...adjusted,
      decision: "APPROVED",
      reasonCode: "TRUSTED_LOW_RISK",
      userMessage: "Content approved.",
    };
  return adjusted;
}

export async function recordModerationCase(input: {
  targetType: "POST" | "COMMENT" | "MEDIA";
  targetId: string;
  ownerId: string;
  result: ModerationResult;
  source?: "LOCAL_RULES" | "SELF_HOSTED";
}) {
  return prisma.moderationCase.create({
    data: {
      targetType: input.targetType,
      targetId: input.targetId,
      ownerId: input.ownerId,
      decision: input.result.decision,
      source: input.source ?? "LOCAL_RULES",
      provider: input.result.provider,
      riskScore: input.result.riskScore,
      reasonCode: input.result.reasonCode,
      userMessage: input.result.userMessage,
      signals: input.result.signals,
      contentHash: input.result.contentHash,
      modelVersion: "1",
    },
  });
}

export async function moderateMediaMetadata(input: {
  ownerId: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl?: string;
  altText: string;
  selectedCategory?: string;
  contentHash: string;
}) {
  const endpoint = process.env.MODERATION_MEDIA_ENDPOINT;
  if (endpoint) {
    try {
      return await new SelfHostedMediaModerationProvider(
        endpoint,
        process.env.MODERATION_MEDIA_TOKEN,
      ).moderate(input);
    } catch (error) {
      reportServerError("media-moderation-provider", error);
    }
  }
  const text = moderateText({ text: input.altText, requireRelevance: true });
  if (text.decision === "REJECTED") return text;
  return {
    ...text,
    decision: "UNDER_REVIEW" as const,
    riskScore: Math.max(0.55, text.riskScore),
    reasonCode: "MEDIA_REVIEW_REQUIRED",
    userMessage: "Media is under review before it can appear publicly.",
    provider: "metadata-fallback-v1",
    contentHash: input.contentHash,
    signals: [...text.signals, "SEMANTIC_MEDIA_SCAN_PENDING"],
  };
}
