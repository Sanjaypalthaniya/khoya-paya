import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { recalculatePostPublicationEligibility } from "@/lib/community/publication";
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";

const schema = z.object({
  action: z.enum([
    "APPROVE",
    "REJECT",
    "RESTORE",
    "HIDE",
    "DELETE",
    "WARN",
    "SUSPEND",
  ]),
  reason: z.string().trim().min(3).max(1000),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
) {
  const admin = await getAdmin();
  if (!admin) return unauthorizedResponse();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationErrorResponse(parsed.error);
  const entry = await prisma.moderationCase.findUnique({
    where: { id: (await params).caseId },
  });
  if (!entry) return errorResponse("Moderation case not found.", 404);
  const { action, reason } = parsed.data;

  await prisma.$transaction(async (tx) => {
    let parentPostId: string | null = null;
    if (entry.targetType === "POST") {
      parentPostId = entry.targetId;
      if (action === "APPROVE" || action === "RESTORE")
        await tx.communityPost.update({
          where: { id: entry.targetId },
          data: { moderationStatus: "APPROVED", moderationReason: reason },
        });
      if (action === "REJECT" || action === "HIDE")
        await tx.communityPost.update({
          where: { id: entry.targetId },
          data: {
            moderationStatus: "REJECTED",
            status: "HIDDEN",
            moderationReason: reason,
          },
        });
      if (action === "DELETE")
        await tx.communityPost.update({
          where: { id: entry.targetId },
          data: {
            status: "REMOVED",
            deletedAt: new Date(),
            moderationReason: reason,
          },
        });
    }
    if (entry.targetType === "COMMENT") {
      if (action === "APPROVE" || action === "RESTORE")
        await tx.communityComment.update({
          where: { id: entry.targetId },
          data: {
            moderationStatus: "APPROVED",
            status: "ACTIVE",
            moderationReason: reason,
          },
        });
      if (["REJECT", "HIDE", "DELETE"].includes(action))
        await tx.communityComment.update({
          where: { id: entry.targetId },
          data: {
            moderationStatus: "REJECTED",
            status: action === "DELETE" ? "REMOVED" : "HIDDEN",
            moderationReason: reason,
          },
        });
    }
    if (
      entry.targetType === "MEDIA" &&
      ["APPROVE", "RESTORE", "REJECT", "DELETE"].includes(action)
    ) {
      const media = await tx.postMedia.update({
        where: { id: entry.targetId },
        data: {
          moderationStatus:
            action === "REJECT"
              ? "REJECTED"
              : action === "DELETE"
                ? "REJECTED"
                : "APPROVED",
          processingStatus: action === "DELETE" ? "REMOVED" : undefined,
          deletedAt: action === "DELETE" ? new Date() : undefined,
          moderationReason: reason,
        },
        select: { postId: true },
      });
      parentPostId = media.postId;
    }
    if ((action === "SUSPEND" || action === "WARN") && entry.ownerId)
      await tx.user.update({
        where: { id: entry.ownerId },
        data:
          action === "SUSPEND"
            ? {
                isBlocked: true,
                postingRestrictedUntil: new Date(Date.now() + 7 * 864e5),
                moderationStrikeCount: { increment: 1 },
              }
            : {
                trustScore: { decrement: 5 },
                moderationStrikeCount: { increment: 1 },
              },
      });
    await tx.moderationAction.create({
      data: { caseId: entry.id, adminId: admin.id, action, reason },
    });
    await tx.moderationCase.update({
      where: { id: entry.id },
      data: {
        decision:
          action === "APPROVE" || action === "RESTORE"
            ? "APPROVED"
            : "REJECTED",
        source: "ADMIN",
        reviewedById: admin.id,
        reviewedAt: new Date(),
        userMessage: reason,
      },
    });
    if (parentPostId && !["REJECT", "HIDE", "DELETE"].includes(action))
      await recalculatePostPublicationEligibility(tx, parentPostId);
  });
  for (const path of [
    "/community",
    "/admin/moderation",
    "/dashboard/community-posts",
    "/lost-items",
  ])
    revalidatePath(path);
  return successResponse("Moderation action applied.");
}
