import { prisma } from "@/lib/prisma";

export const BUSINESS_UPGRADE_MESSAGE = "Bulk tools are available only on Business plan. Please upgrade to continue.";

export async function getUserActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });
}

export async function isBusinessUser(userId: string) {
  const subscription = await getUserActiveSubscription(userId);
  const planSlug = subscription?.plan.slug?.toLowerCase() ?? "";
  const planName = subscription?.plan.name.toLowerCase() ?? "";
  return planSlug.includes("business") || planName.includes("business");
}

export async function requireBusinessPlan(userId: string) {
  if (await isBusinessUser(userId)) {
    return { success: true as const };
  }

  return { success: false as const, message: BUSINESS_UPGRADE_MESSAGE };
}

export async function getBulkUploadLimit(userId: string) {
  return (await isBusinessUser(userId)) ? 500 : 0;
}
