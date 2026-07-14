import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/api-response";
export async function GET(request: Request) {
  if (!enforceRateLimit(request, "lost-search", 30).allowed) return rateLimitResponse();
  const url = new URL(request.url); const query = url.searchParams.get("q")?.trim() ?? ""; const category = url.searchParams.get("category")?.trim();
  const items = await prisma.item.findMany({ where: { status: "LOST", publicSearchVisible: true, ...(category ? { category } : {}), ...(query ? { OR: [{ itemName: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { brand: { contains: query, mode: "insensitive" } }, { color: { contains: query, mode: "insensitive" } }, { lastSeenLocation: { contains: query, mode: "insensitive" } }] } : {}) }, take: 30, orderBy: { updatedAt: "desc" }, select: { itemName: true, category: true, brand: true, color: true, description: true, lastSeenLocation: true, recoveryCode: true, imageUrl: true } });
  return successResponse("Lost items loaded.", { items });
}
