import {
  Prisma,
  type CommunityModerationStatus,
  type CommunityVisibility,
  type PostMediaProcessingStatus,
} from "@prisma/client";

export const PUBLIC_POST_WHERE = {
  status: "PUBLISHED",
  visibility: "PUBLIC",
  moderationStatus: "APPROVED",
  deletedAt: null,
  author: { isBlocked: false },
} satisfies Prisma.CommunityPostWhereInput;

/** The single source of truth for media that may leave a public API. */
export function getPublicMediaEligibilityFilter(
  postId?: string,
): Prisma.PostMediaWhereInput {
  return {
    deletedAt: null,
    processingStatus: "READY",
    moderationStatus: "APPROVED",
    ...(postId ? { postId } : {}),
    post: PUBLIC_POST_WHERE,
  };
}

export function isPublicMediaEligible(media: PublicationMedia) {
  return (
    media.deletedAt === null &&
    media.processingStatus === "READY" &&
    media.moderationStatus === "APPROVED"
  );
}

export const publicMediaInclude = {
  where: getPublicMediaEligibilityFilter(),
  orderBy: { sortOrder: "asc" },
} satisfies Prisma.CommunityPost$mediaArgs;

export type PublicationMedia = {
  processingStatus: PostMediaProcessingStatus;
  moderationStatus: CommunityModerationStatus;
  deletedAt: Date | null;
};

export function evaluatePostPublicationEligibility(input: {
  textModerationStatus: CommunityModerationStatus;
  media: PublicationMedia[];
  visibility: CommunityVisibility;
  authorBlocked?: boolean;
  requiredFieldsPresent?: boolean;
  adminOverride?: "APPROVE" | "REJECT" | null;
}) {
  if (input.authorBlocked)
    return {
      eligible: false,
      reason: "The author account is suspended.",
    } as const;
  if (
    input.adminOverride === "REJECT" ||
    input.textModerationStatus === "REJECTED"
  )
    return {
      eligible: false,
      reason: "Content was rejected during review.",
    } as const;
  if (input.requiredFieldsPresent === false)
    return {
      eligible: false,
      reason: "Required post details are incomplete.",
    } as const;
  if (input.visibility !== "PUBLIC")
    return {
      eligible: false,
      reason: "Only public posts may be published to the public feed.",
    } as const;
  if (
    input.textModerationStatus !== "APPROVED" &&
    input.adminOverride !== "APPROVE"
  )
    return { eligible: false, reason: "Post text is under review." } as const;
  return { eligible: true, reason: null } as const;
}

export async function recalculatePostPublicationEligibility(
  tx: Prisma.TransactionClient,
  postId: string,
) {
  const post = await tx.communityPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      status: true,
      visibility: true,
      moderationStatus: true,
      title: true,
      description: true,
      author: { select: { isBlocked: true } },
      media: {
        where: { deletedAt: null },
        select: {
          processingStatus: true,
          moderationStatus: true,
          deletedAt: true,
        },
      },
    },
  });
  if (!post) return null;
  const textCase = await tx.moderationCase.findFirst({
    where: { targetType: "POST", targetId: postId },
    orderBy: { createdAt: "desc" },
    select: { decision: true },
  });
  const textStatus =
    textCase?.decision === "APPROVED"
      ? "APPROVED"
      : textCase?.decision === "REJECTED"
        ? "REJECTED"
        : post.moderationStatus;
  const result = evaluatePostPublicationEligibility({
    textModerationStatus: textStatus,
    media: post.media,
    visibility: post.visibility,
    authorBlocked: post.author.isBlocked,
    requiredFieldsPresent: Boolean(
      post.title.trim() && post.description.trim(),
    ),
  });
  if (["HIDDEN", "REMOVED", "CLOSED", "RECOVERED"].includes(post.status))
    return result;
  await tx.communityPost.update({
    where: { id: post.id },
    data: {
      status: result.eligible ? "PUBLISHED" : "DRAFT",
      publishedAt: result.eligible ? new Date() : null,
      moderationStatus: result.eligible ? "APPROVED" : post.moderationStatus,
      moderationReason: result.reason,
    },
  });
  return result;
}
