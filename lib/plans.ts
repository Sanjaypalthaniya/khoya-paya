import { BillingCycle, Prisma, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCurrentPlan(userId: string) {
  const now = new Date();
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (subscription) return { plan: subscription.plan, subscription };
  const plan = await prisma.plan.findUnique({ where: { slug: "free" } });
  return { plan, subscription: null };
}

export async function hasPaidPlan(userId: string) {
  const { plan, subscription } = await getCurrentPlan(userId);
  return Boolean(subscription && plan && plan.billingCycle !== BillingCycle.FREE);
}

export function planExpiry(cycle: BillingCycle, from = new Date()) {
  const expiresAt = new Date(from);
  if (cycle === BillingCycle.MONTHLY) expiresAt.setMonth(expiresAt.getMonth() + 1);
  else if (cycle === BillingCycle.YEARLY) expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  else return null;
  return expiresAt;
}

export async function enforceItemLimit(tx: Prisma.TransactionClient, userId: string) {
  const now = new Date();
  const subscription = await tx.subscription.findFirst({
    where: { userId, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  const plan = subscription?.plan ?? await tx.plan.findUnique({ where: { slug: "free" } });
  const itemLimit = plan?.itemLimit ?? 2;
  const itemCount = await tx.item.count({ where: { userId } });
  if (itemCount >= itemLimit) throw new Error(`PLAN_LIMIT:${itemLimit}:${plan?.name ?? "Free"}`);
  return { plan, itemCount, itemLimit };
}
