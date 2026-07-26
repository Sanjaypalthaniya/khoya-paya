import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaderboard } from "@/lib/community/leaderboard";
import { reportServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const publicPost = { visibility: "PUBLIC" as const, moderationStatus: "APPROVED" as const, deletedAt: null };

export async function GET() {
  try {
    const [
      itemsRecovered, peopleHelpedRows, helpSolved, verifiedRecoveries,
      communityHeroes, trustedMembers, bloodRequestsCompleted, lostPetsReunited,
      communityPosts, successStories, recentRecoveries, returnedItems,
      achievements, rankedHelpers, testimonials,
    ] = await Promise.all([
      prisma.item.count({ where: { status: "RECOVERED", deletedAt: null } }),
      prisma.claimRequest.groupBy({ by: ["requesterId"], where: { recoveredAt: { not: null }, deletedAt: null } }),
      prisma.communityPost.count({ where: { ...publicPost, postType: "NEED_HELP", status: { in: ["RECOVERED", "CLOSED"] } } }),
      prisma.claimRequest.count({ where: { deletedAt: null, verificationScore: { gt: 0 }, status: { in: ["VERIFIED", "RETURNED", "RECOVERY_CONFIRMED", "CLOSED"] } } }),
      prisma.user.count({ where: { isBlocked: false, trustScore: { gte: 80 } } }),
      prisma.user.count({ where: { isBlocked: false, OR: [{ verificationLevel: { not: null } }, { trustScore: { gte: 40 } }] } }),
      prisma.communityPost.count({ where: { ...publicPost, postType: "NEED_HELP", status: { in: ["RECOVERED", "CLOSED"] }, OR: [{ title: { contains: "blood", mode: "insensitive" } }, { description: { contains: "blood", mode: "insensitive" } }] } }),
      prisma.communityPost.count({ where: { ...publicPost, postType: "MISSING_PET", status: "RECOVERED" } }),
      prisma.communityPost.count({ where: { ...publicPost, status: { in: ["PUBLISHED", "CLAIM_PENDING", "VERIFICATION_PENDING", "RECOVERED", "CLOSED"] } } }),
      prisma.communityPost.count({ where: { ...publicPost, postType: "SUCCESS_STORY", status: "PUBLISHED" } }),
      prisma.communityPost.findMany({ where: { ...publicPost, status: "RECOVERED", recoveredAt: { not: null } }, orderBy: { recoveredAt: "desc" }, take: 6, select: { id: true, title: true, itemCategory: true, city: true, state: true, recoveredAt: true, author: { select: { name: true } }, media: { where: { deletedAt: null, processingStatus: "READY", moderationStatus: "APPROVED" }, orderBy: { sortOrder: "asc" }, take: 1, select: { thumbnailUrl: true, url: true, altText: true } } } }),
      prisma.communityPost.findMany({ where: { ...publicPost, OR: [{ postType: "RECOVERED_ITEM" }, { status: "RECOVERED" }] }, orderBy: [{ recoveredAt: "desc" }, { updatedAt: "desc" }], take: 5, select: { id: true, title: true, itemCategory: true, city: true, state: true, recoveredAt: true, updatedAt: true } }),
      prisma.achievementDefinition.findMany({ where: { isActive: true }, take: 6, orderBy: { target: "asc" }, select: { id: true, code: true, name: true, description: true, target: true, achievements: { where: { completedAt: { not: null } }, select: { id: true } } } }),
      leaderboard("TOP_HELPERS", "WEEKLY", 6),
      prisma.communityPost.findMany({ where: { ...publicPost, postType: "SUCCESS_STORY", status: "PUBLISHED", isVerifiedPost: true, author: { verificationLevel: { not: null } } }, orderBy: { publishedAt: "desc" }, take: 6, select: { id: true, title: true, description: true, city: true, state: true, publishedAt: true, author: { select: { name: true, verificationLevel: true, trustScore: true } } } }),
    ]);

    let helpers = rankedHelpers;
    if (!helpers.length) {
      const fallback = await prisma.user.findMany({ where: { isBlocked: false, leaderboardOptOut: false, trustScore: { gt: 0 } }, orderBy: [{ trustScore: "desc" }, { createdAt: "asc" }], take: 6, select: { id: true, name: true, trustScore: true, publicCity: true, publicState: true } });
      helpers = fallback.map((user, index) => ({ rank: index + 1, score: user.trustScore, calculatedAt: new Date(), user: { ...user, trustProfile: null, userBadges: [] } }));
    }

    return NextResponse.json({ success: true, data: {
      counters: { itemsRecovered, peopleHelped: peopleHelpedRows.length, helpRequestsSolved: helpSolved, verifiedRecoveries, communityHeroes, trustedMembers, bloodRequestsCompleted, lostPetsReunited, communityPosts, successStories },
      heroes: helpers.map(item => ({ rank: item.rank, score: Math.round(item.score), id: item.user.id, name: item.user.name, initials: item.user.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase(), trustScore: item.user.trustScore, location: [item.user.publicCity, item.user.publicState].filter(Boolean).join(", "), badge: item.user.userBadges[0]?.badge?.name ?? null })),
      recentRecoveries: recentRecoveries.map(item => ({ ...item, image: item.media[0]?.thumbnailUrl ?? item.media[0]?.url ?? null, imageAlt: item.media[0]?.altText ?? item.title })),
      returnedItems,
      achievements: achievements.map(item => ({ code: item.code, name: item.name, description: item.description, target: item.target, completedCount: item.achievements.length })),
      testimonials: testimonials.map(item => ({ id: item.id, title: item.title, quote: item.description.slice(0, 320), author: item.author.name, verificationLevel: item.author.verificationLevel, trustScore: item.author.trustScore, location: [item.city, item.state].filter(Boolean).join(", "), publishedAt: item.publishedAt })),
      updatedAt: new Date().toISOString(),
    } }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    reportServerError("community-impact", error);
    return NextResponse.json({ success: false, message: "Community impact is temporarily unavailable." }, { status: 500 });
  }
}
