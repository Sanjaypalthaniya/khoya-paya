import { PrismaClient } from "@prisma/client";
import { communityMapping } from "../lib/items/community-integration";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const items = await prisma.item.findMany({
    where: {
      deletedAt: null,
      status: { in: ["LOST", "FOUND", "MISSING"] },
      OR: [{ visibility: "PUBLIC" }, { publicSearchVisible: true }],
      communityPost: null,
    },
  });
  const result = { mode: apply ? "apply" : "dry-run", eligible: items.length, created: 0, skipped: 0, failed: 0 };
  for (const item of items) {
    const mapping = communityMapping(item.status, item.category);
    if (!mapping || !item.lostDate || !item.lastSeenLocation || item.description.trim().length < 20) { result.skipped++; continue; }
    if (!apply) continue;
    try {
      await prisma.communityPost.upsert({
        where: { itemId: item.id },
        update: {},
        create: { itemId: item.id, authorId: item.userId, postType: mapping.postType, itemCategory: mapping.category, title: item.itemName, description: item.description, status: "PUBLISHED", visibility: "PUBLIC", moderationStatus: "APPROVED", publishedAt: new Date(), eventDate: item.lostDate, publicLocationName: item.lastSeenLocation, rewardOffered: item.rewardAmount !== null, rewardAmount: item.rewardAmount, contactPreference: "PLATFORM_MESSAGE" },
      });
      result.created++;
    } catch (error) { result.failed++; console.error(`Failed item ${item.id}:`, error); }
  }
  console.log(JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
