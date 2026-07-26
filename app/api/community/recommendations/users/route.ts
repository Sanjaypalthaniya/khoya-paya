import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { communityFailure, communitySuccess } from "@/lib/community/api";
export async function GET() {
  try {
    const viewer = await getCurrentUser();
    const dismissed = viewer ? await prisma.recommendationDismissal.findMany({ where: { userId: viewer.id, targetType: "USER", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, select: { targetId: true } }) : [];
    const users = await prisma.user.findMany({ where: { isBlocked: false, leaderboardOptOut: false, id: { notIn: [viewer?.id ?? "", ...dismissed.map(item => item.targetId)] } }, orderBy: [{ trustScore: "desc" }, { createdAt: "asc" }], take: 10, select: { id: true, name: true, trustScore: true, verificationLevel: true, publicCity: true, publicState: true, followerCount: true } });
    return communitySuccess("Suggested public users", users.map(user => ({ ...user, verified: Boolean(user.verificationLevel), explanation: user.trustScore >= 50 ? "Trusted community contributor" : "Active public community member" })));
  } catch (error) { return communityFailure(error, "community.recommendations.users"); }
}
