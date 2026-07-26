import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { communityFailure, communitySuccess } from "@/lib/community/api";
import { CommunityError } from "@/lib/community/errors";
import {
  enforceCommunityRateLimit,
  requireCommunityUser,
} from "@/lib/community/route-auth";

const schema = z.object({
  targetType: z.enum(["POST", "COMMENT", "USER"]),
  targetId: z.string().min(1),
  reason: z.enum([
    "SPAM",
    "FRAUD",
    "WRONG_CATEGORY",
    "ADULT_CONTENT",
    "VIOLENCE",
    "HARASSMENT",
    "COPYRIGHT",
    "WRONG_INFORMATION",
    "UNSAFE_CONTENT",
    "DUPLICATE_CONTENT",
    "ITEM_ALREADY_RECOVERED",
    "IMPERSONATION",
    "PRIVACY_VIOLATION",
    "SCAM_OR_PAYMENT_REQUEST",
    "OTHER",
  ]),
  details: z.string().trim().max(1000).optional(),
});
export async function GET() {
  try {
    const user = await requireCommunityUser();
    const reports = await prisma.communityReport.findMany({
      where: { reporterId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        targetType: true,
        reason: true,
        status: true,
        resolution: true,
        createdAt: true,
        targetPost: { select: { title: true } },
        targetComment: { select: { content: true } },
        targetUser: { select: { name: true } },
      },
    });
    return communitySuccess(
      "Your reports",
      reports.map((report) => ({
        id: report.id,
        targetType: report.targetType,
        targetSummary:
          report.targetPost?.title ??
          report.targetComment?.content.slice(0, 80) ??
          report.targetUser?.name ??
          "Removed content",
        reason: report.reason,
        status: report.status,
        resolution: report.resolution,
        createdAt: report.createdAt,
      })),
    );
  } catch (error) {
    return communityFailure(error, "community.reports.mine");
  }
}
export async function POST(request: Request) {
  try {
    const user = await requireCommunityUser();
    enforceCommunityRateLimit(request, "report", user.id, 10, 60 * 60_000);
    const input = schema.parse(await request.json());
    const target = await resolveTarget(input.targetType, input.targetId);
    if (!target)
      throw new CommunityError(
        "NOT_FOUND",
        "Reported content was not found.",
        404,
      );
    if (target.ownerId === user.id)
      throw new CommunityError(
        "VALIDATION_ERROR",
        "You cannot report your own content.",
        400,
      );
    const report = await prisma.communityReport
      .create({
        data: {
          reporterId: user.id,
          targetType: input.targetType,
          reason: input.reason,
          details: input.details,
          ...(input.targetType === "POST"
            ? { targetPostId: input.targetId }
            : input.targetType === "COMMENT"
              ? { targetCommentId: input.targetId }
              : { targetUserId: input.targetId }),
        },
      })
      .catch((e) => {
        if ((e as { code?: string }).code === "P2002")
          throw new CommunityError(
            "DUPLICATE_REPORT",
            "You already reported this content.",
            409,
          );
        throw e;
      });
    const trusted = await prisma.communityReport.count({
      where: {
        targetType: input.targetType,
        status: "OPEN",
        ...(input.targetType === "POST"
          ? { targetPostId: input.targetId }
          : input.targetType === "COMMENT"
            ? { targetCommentId: input.targetId }
            : { targetUserId: input.targetId }),
        reporter: { trustScore: { gte: 40 }, isBlocked: false },
      },
    });
    if (trusted >= 3) {
      if (input.targetType === "POST")
        await prisma.communityPost.update({
          where: { id: input.targetId },
          data: {
            status: "HIDDEN",
            moderationStatus: "AUTO_HIDDEN",
            moderationReason:
              "Temporarily hidden after multiple trusted community reports.",
          },
        });
      if (input.targetType === "COMMENT")
        await prisma.communityComment.update({
          where: { id: input.targetId },
          data: {
            status: "HIDDEN",
            moderationStatus: "AUTO_HIDDEN",
            moderationReason:
              "Temporarily hidden after multiple trusted community reports.",
          },
        });
    }
    return communitySuccess(
      "Report submitted for review.",
      { id: report.id, status: report.status, autoHidden: trusted >= 3 },
      201,
    );
  } catch (e) {
    return communityFailure(e, "community.report");
  }
}
async function resolveTarget(type: "POST" | "COMMENT" | "USER", id: string) {
  if (type === "POST")
    return prisma.communityPost
      .findUnique({ where: { id }, select: { authorId: true } })
      .then((v) => v && { ownerId: v.authorId });
  if (type === "COMMENT")
    return prisma.communityComment
      .findUnique({ where: { id }, select: { authorId: true } })
      .then((v) => v && { ownerId: v.authorId });
  return prisma.user
    .findUnique({ where: { id }, select: { id: true } })
    .then((v) => v && { ownerId: v.id });
}
