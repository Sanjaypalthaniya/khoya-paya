import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planExpiry } from "@/lib/plans";
import { z } from "zod";

const schema = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid payment response." }, { status: 400 });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ success: false, message: "Payment verification is not configured." }, { status: 500 });

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: parsed.data.razorpay_order_id }, include: { plan: true } });
  if (!payment || payment.userId !== user.id) return NextResponse.json({ success: false, message: "Payment order not found." }, { status: 404 });
  const expected = crypto.createHmac("sha256", secret).update(`${parsed.data.razorpay_order_id}|${parsed.data.razorpay_payment_id}`).digest("hex");
  if (expected.length !== parsed.data.razorpay_signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.data.razorpay_signature))) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "Payment signature verification failed." }, { status: 400 });
  }

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({ where: { id: payment.id } });
    if (existing?.status === "PAID" && existing.subscriptionId) return tx.subscription.findUnique({ where: { id: existing.subscriptionId }, include: { plan: true } });
    await tx.subscription.updateMany({ where: { userId: user.id, status: "ACTIVE" }, data: { status: "CANCELLED" } });
    const subscription = await tx.subscription.create({ data: { userId: user.id, planId: payment.planId, status: "ACTIVE", startedAt: now, expiresAt: planExpiry(payment.plan.billingCycle, now), razorpayOrderId: parsed.data.razorpay_order_id, razorpayPaymentId: parsed.data.razorpay_payment_id, razorpaySignature: parsed.data.razorpay_signature }, include: { plan: true } });
    await tx.payment.update({ where: { id: payment.id }, data: { status: "PAID", subscriptionId: subscription.id, razorpayPaymentId: parsed.data.razorpay_payment_id, razorpaySignature: parsed.data.razorpay_signature } });
    await tx.notification.create({ data: { userId: user.id, type: "PAYMENT_SUCCESS", title: "Plan upgraded successfully", message: `Your ${payment.plan.name} plan is now active.`, link: "/dashboard/billing", metadata: { paymentId: payment.id, subscriptionId: subscription.id } } });
    return subscription;
  });
  return NextResponse.json({ success: true, message: "Payment verified and plan activated.", data: { subscription: result } });
}
