import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { reportServerError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const startOfDay = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  try {
    const now = new Date(), today = startOfDay(now), thirtyDaysAgo = new Date(today.getTime() - 29 * 864e5), ninetyDaysAgo = new Date(today.getTime() - 89 * 864e5);
    const [
      todayUsers, dau, mau, lostReports, foundReports, helpPosts, recoveredItems,
      totalRecoveryRequests, successfulRecoveryRequests, recoveryDurations,
      communityPosts, pendingClaims, openRecoveryRequests, verifiedUsers, communityHeroes,
      spamBlocked, moderationGrouped, reportsPendingReview, revenueAggregate,
      subscriptions, premiumUsers, qrRegistrations, qrScans, categories, cities, countries,
      activeUsers, helpfulUsers, recentUsers, recentPosts, recentRecoveries, recentPayments,
      trendUsers, trendPosts, trendRecoveries, trendScans, trendPayments, scanHeatmap,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: today }, isBlocked: false } }),
      prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo }, isBlocked: false } }),
      prisma.communityPost.count({ where: { postType: { in: ["LOST_ITEM", "MISSING_PET", "LOST_DOCUMENT"] }, deletedAt: null } }),
      prisma.foundReport.count(),
      prisma.communityPost.count({ where: { postType: "NEED_HELP", deletedAt: null } }),
      prisma.item.count({ where: { status: "RECOVERED", deletedAt: null } }),
      prisma.recoveryRequest.count({ where: { status: { notIn: ["CANCELLED", "FALSE_REPORT"] } } }),
      prisma.recoveryRequest.count({ where: { status: { in: ["RETURNED", "COMPLETED"] } } }),
      prisma.claimRequest.findMany({ where: { recoveredAt: { not: null }, createdAt: { gte: ninetyDaysAgo }, deletedAt: null }, select: { createdAt: true, recoveredAt: true } }),
      prisma.communityPost.count({ where: { deletedAt: null } }),
      prisma.claimRequest.count({ where: { deletedAt: null, status: { in: ["SUBMITTED", "UNDER_REVIEW", "NEEDS_MORE_INFORMATION", "VERIFICATION_PENDING", "RETURN_ARRANGEMENT_PENDING", "HANDOVER_PENDING"] } } }),
      prisma.recoveryRequest.count({ where: { status: { notIn: ["RETURNED", "COMPLETED", "CANCELLED", "FALSE_REPORT"] } } }),
      prisma.user.count({ where: { verificationLevel: { not: null }, isBlocked: false } }),
      prisma.user.count({ where: { trustScore: { gte: 80 }, isBlocked: false } }),
      prisma.moderationCase.count({ where: { decision: "REJECTED", OR: [{ reasonCode: { contains: "spam", mode: "insensitive" } }, { reasonCode: { contains: "duplicate", mode: "insensitive" } }] } }),
      prisma.moderationCase.groupBy({ by: ["decision"], _count: { id: true } }),
      prisma.communityReport.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      prisma.subscription.count({ where: { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
      prisma.user.count({ where: { subscriptions: { some: { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }], plan: { billingCycle: { not: "FREE" } } } } } }),
      prisma.qRCode.count(),
      prisma.scanLog.count(),
      prisma.communityPost.groupBy({ by: ["itemCategory"], where: { deletedAt: null }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
      prisma.communityPost.groupBy({ by: ["city"], where: { deletedAt: null, city: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
      prisma.communityPost.groupBy({ by: ["country"], where: { deletedAt: null, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
      prisma.user.findMany({ where: { isBlocked: false }, orderBy: [{ lastActiveAt: "desc" }, { createdAt: "desc" }], take: 8, select: { id: true, name: true, email: true, lastActiveAt: true, trustScore: true, _count: { select: { communityPosts: true, communityComments: true } } } }),
      prisma.trustProfile.findMany({ where: { user: { isBlocked: false } }, orderBy: [{ verifiedReturns: "desc" }, { successfulReturns: "desc" }, { helpfulComments: "desc" }], take: 8, select: { verifiedReturns: true, successfulReturns: true, helpfulComments: true, trustScore: true, user: { select: { id: true, name: true, email: true } } } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, createdAt: true } }),
      prisma.communityPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, postType: true, createdAt: true } }),
      prisma.recoveryRequest.findMany({ where: { status: { in: ["RETURNED", "COMPLETED"] } }, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, status: true, updatedAt: true, item: { select: { itemName: true } } } }),
      prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, amount: true, status: true, currency: true, createdAt: true, user: { select: { name: true } } } }),
      prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.communityPost.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.recoveryRequest.findMany({ where: { status: { in: ["RETURNED", "COMPLETED"] }, updatedAt: { gte: thirtyDaysAgo } }, select: { updatedAt: true } }),
      prisma.scanLog.findMany({ where: { scannedAt: { gte: thirtyDaysAgo } }, select: { scannedAt: true } }),
      prisma.payment.findMany({ where: { status: "PAID", createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true, amount: true } }),
      prisma.scanLog.findMany({ where: { scannedAt: { gte: ninetyDaysAgo } }, orderBy: { scannedAt: "desc" }, take: 10000, select: { scannedAt: true } }),
    ]);

    const moderation = Object.fromEntries(moderationGrouped.map(row => [row.decision, row._count.id]));
    const avgRecoveryHours = recoveryDurations.length ? recoveryDurations.reduce((sum, row) => sum + ((row.recoveredAt!.getTime() - row.createdAt.getTime()) / 36e5), 0) / recoveryDurations.length : 0;
    const days = Array.from({ length: 30 }, (_, index) => new Date(thirtyDaysAgo.getTime() + index * 864e5));
    const countByDay = (rows: Date[]) => { const counts = new Map<string, number>(); rows.forEach(date => counts.set(dayKey(date), (counts.get(dayKey(date)) ?? 0) + 1)); return days.map(date => counts.get(dayKey(date)) ?? 0); };
    const revenueByDay = new Map<string, number>(); trendPayments.forEach(row => revenueByDay.set(dayKey(row.createdAt), (revenueByDay.get(dayKey(row.createdAt)) ?? 0) + Number(row.amount)));
    const heatmap = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)); scanHeatmap.forEach(row => { heatmap[row.scannedAt.getUTCDay()][row.scannedAt.getUTCHours()] += 1; });
    const activity = [
      ...recentUsers.map(item => ({ id: `user-${item.id}`, type: "USER", title: `${item.name} joined`, at: item.createdAt })),
      ...recentPosts.map(item => ({ id: `post-${item.id}`, type: "POST", title: item.title, detail: item.postType.replaceAll("_", " "), at: item.createdAt })),
      ...recentRecoveries.map(item => ({ id: `recovery-${item.id}`, type: "RECOVERY", title: `${item.item.itemName} ${item.status.toLowerCase()}`, at: item.updatedAt })),
      ...recentPayments.map(item => ({ id: `payment-${item.id}`, type: "PAYMENT", title: `${item.user.name} · ${item.currency} ${Number(item.amount).toLocaleString("en-IN")}`, detail: item.status, at: item.createdAt })),
    ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 14);

    return NextResponse.json({ success: true, data: {
      metrics: { todayUsers, dailyActiveUsers: dau, monthlyActiveUsers: mau, lostReports, foundReports, needHelpPosts: helpPosts, recoveredItems, recoverySuccessRate: totalRecoveryRequests ? successfulRecoveryRequests / totalRecoveryRequests * 100 : 0, averageRecoveryHours: avgRecoveryHours, communityPosts, pendingClaims, openRecoveryRequests, verifiedUsers, communityHeroes, spamBlocked, reportsPendingReview, revenue: Number(revenueAggregate._sum.amount ?? 0), subscriptions, premiumUsers, qrRegistrations, qrScans },
      moderation: { approved: moderation.APPROVED ?? 0, underReview: moderation.UNDER_REVIEW ?? 0, rejected: moderation.REJECTED ?? 0, total: moderationGrouped.reduce((sum, row) => sum + row._count.id, 0) },
      trends: { labels: days.map(date => date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })), users: countByDay(trendUsers.map(row => row.createdAt)), posts: countByDay(trendPosts.map(row => row.createdAt)), recoveries: countByDay(trendRecoveries.map(row => row.updatedAt)), scans: countByDay(trendScans.map(row => row.scannedAt)), revenue: days.map(date => revenueByDay.get(dayKey(date)) ?? 0) },
      heatmap,
      rankings: { categories: categories.map(row => ({ label: row.itemCategory.replaceAll("_", " "), value: row._count.id })), cities: cities.map(row => ({ label: row.city!, value: row._count.id })), countries: countries.map(row => ({ label: row.country!, value: row._count.id })), activeUsers: activeUsers.map(user => ({ id: user.id, name: user.name, email: user.email, value: user._count.communityPosts + user._count.communityComments, detail: `${user._count.communityPosts} posts · ${user._count.communityComments} comments`, trustScore: user.trustScore })), helpfulUsers: helpfulUsers.map(profile => ({ id: profile.user.id, name: profile.user.name, email: profile.user.email, value: profile.verifiedReturns * 10 + profile.successfulReturns * 5 + profile.helpfulComments, detail: `${profile.verifiedReturns} verified returns · ${profile.helpfulComments} helpful comments`, trustScore: profile.trustScore })) },
      activity: activity.map(item => ({ ...item, at: item.at.toISOString() })),
      updatedAt: now.toISOString(),
    } }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    reportServerError("admin-analytics", error);
    return NextResponse.json({ success: false, message: "Analytics are temporarily unavailable." }, { status: 500 });
  }
}
