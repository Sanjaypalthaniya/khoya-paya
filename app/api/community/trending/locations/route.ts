import { prisma } from "@/lib/prisma";
import { communitySuccess, communityFailure } from "@/lib/community/api";
export async function GET() {
  try {
    const rows = await prisma.communityPost.groupBy({ by: ["city", "state", "country"], where: { status: "PUBLISHED", visibility: "PUBLIC", moderationStatus: "APPROVED", deletedAt: null, city: { not: null }, publishedAt: { gte: new Date(Date.now() - 30 * 864e5) } }, _count: { id: true }, _sum: { trendingScore: true }, having: { id: { _count: { gte: 2 } } }, orderBy: { _count: { id: "desc" } }, take: 20 });
    return communitySuccess("Trending public locations", rows.map(row => ({ city: row.city, state: row.state, country: row.country, postCount: row._count.id, score: Number((row._sum.trendingScore ?? 0).toFixed(2)) })));
  } catch (error) { return communityFailure(error, "community.trending.locations"); }
}
