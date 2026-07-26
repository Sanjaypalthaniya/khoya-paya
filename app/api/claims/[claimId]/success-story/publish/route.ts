import { prisma } from "@/lib/prisma";
import { communityFailure, communitySuccess } from "@/lib/community/api";
import {
  requireCommunityUser,
  enforceCommunityRateLimit,
} from "@/lib/community/route-auth";
import {
  moderateSubmission,
  recordModerationCase,
} from "@/lib/moderation/service";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ claimId: string }> },
) {
  try {
    const user = await requireCommunityUser();
    enforceCommunityRateLimit(
      request,
      "success-publish",
      user.id,
      3,
      24 * 60 * 60_000,
    );
    const claim = await prisma.claimRequest.findFirst({
      where: {
        id: (await params).claimId,
        status: "RECOVERY_CONFIRMED",
        OR: [{ requesterId: user.id }, { recipientId: user.id }],
        disputes: {
          none: {
            status: { in: ["OPEN", "UNDER_REVIEW", "NEEDS_INFORMATION"] },
          },
        },
      },
      include: { post: true, successConsent: true },
    });
    if (
      !claim?.successConsent?.requesterConsent ||
      !claim.successConsent.recipientConsent
    )
      throw new Error("Both participants must consent before publication.");
    const description = `A ${claim.post.itemCategory.toLowerCase()} was safely returned through Khoya Paya. The participants used private verification and confirmed the handover.`;
    const moderation = await moderateSubmission({
      ownerId: claim.recipientId,
      targetType: "POST",
      text: description,
      requireRelevance: true,
    });
    if (moderation.decision !== "APPROVED")
      throw new Error("Success story requires moderation review.");
    const story = await prisma.$transaction(async (tx) => {
      const data = {
          authorId: claim.recipientId,
          postType: "SUCCESS_STORY",
          itemCategory: claim.post.itemCategory,
          title: "A safe recovery completed",
          description,
          status: "PUBLISHED",
          visibility: "PUBLIC",
          moderationStatus: "APPROVED",
          publishedAt: new Date(),
          city: claim.successConsent?.allowCity ? claim.post.city : null,
          contactPreference: "NO_DIRECT_CONTACT",
          allowComments: true,
          allowSharing: true,
        } as const;
      const created = claim.successConsent?.successPostId
        ? await tx.communityPost.update({ where: { id: claim.successConsent.successPostId }, data })
        : await tx.communityPost.create({ data });
      await tx.claimSuccessConsent.update({
        where: { claimId: claim.id },
        data: { successPostId: created.id },
      });
      await tx.claimActivity.create({
        data: {
          claimId: claim.id,
          actorId: user.id,
          type: "SUCCESS_STORY_CREATED",
          title: "Success story published",
          description: "A consented privacy-safe success story was published.",
        },
      });
      return created;
    });
    await recordModerationCase({
      targetType: "POST",
      targetId: story.id,
      ownerId: claim.recipientId,
      result: moderation,
    });
    return communitySuccess(
      "Success story published.",
      { postId: story.id },
      201,
    );
  } catch (error) {
    return communityFailure(error, "claim.success.publish");
  }
}
