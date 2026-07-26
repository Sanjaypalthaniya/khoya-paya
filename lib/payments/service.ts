import type { Prisma } from "@prisma/client";
import { planExpiry } from "@/lib/plans";

export async function activatePaidOrder(tx: Prisma.TransactionClient, orderId: string, paymentId: string, signature?: string) {
  const payment = await tx.payment.findUnique({ where: { razorpayOrderId: orderId }, include: { plan: true } });
  if (!payment) return null;
  if (payment.status === "PAID" && payment.subscriptionId) return tx.subscription.findUnique({ where: { id: payment.subscriptionId }, include: { plan: true } });
  await tx.subscription.updateMany({ where: { userId: payment.userId, status: "ACTIVE" }, data: { status: "CANCELLED" } });
  const now = new Date();
  const subscription = await tx.subscription.create({ data: { userId: payment.userId, planId: payment.planId, status: "ACTIVE", startedAt: now, expiresAt: planExpiry(payment.plan.billingCycle, now), razorpayOrderId: orderId, razorpayPaymentId: paymentId, razorpaySignature: signature }, include: { plan: true } });
  await tx.payment.update({ where: { id: payment.id }, data: { status: "PAID", subscriptionId: subscription.id, razorpayPaymentId: paymentId, ...(signature ? { razorpaySignature: signature } : {}) } });
  await tx.notification.create({ data: { userId: payment.userId, type: "PAYMENT_SUCCESS", title: "Plan upgraded successfully", message: `Your ${payment.plan.name} plan is now active.`, link: "/dashboard/billing", metadata: { paymentId: payment.id, subscriptionId: subscription.id } } });
  return subscription;
}

export async function markOrderFailed(tx: Prisma.TransactionClient, orderId: string) {
  return tx.payment.updateMany({ where: { razorpayOrderId: orderId, status: "CREATED" }, data: { status: "FAILED" } });
}

export async function markOrderRefunded(tx: Prisma.TransactionClient, orderId: string) {
  return tx.payment.updateMany({ where: { razorpayOrderId: orderId, status: "PAID" }, data: { status: "REFUNDED" } });
}
