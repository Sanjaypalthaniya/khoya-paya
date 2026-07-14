import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpay, publicRazorpayKey } from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({ planSlug: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Please log in to upgrade." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid plan." }, { status: 400 });

  const plan = await prisma.plan.findFirst({ where: { slug: parsed.data.planSlug, isActive: true } });
  if (!plan || plan.billingCycle === "FREE" || plan.billingCycle === "CUSTOM" || Number(plan.price) <= 0) {
    return NextResponse.json({ success: false, message: "This plan cannot be purchased online." }, { status: 400 });
  }

  try {
    const order = await getRazorpay().orders.create({
      amount: Math.round(Number(plan.price) * 100),
      currency: plan.currency,
      receipt: `kp_${Date.now()}_${user.id.slice(-8)}`,
      notes: { userId: user.id, planId: plan.id, planSlug: plan.slug },
    });
    await prisma.payment.create({
      data: { userId: user.id, planId: plan.id, amount: plan.price, currency: plan.currency, razorpayOrderId: order.id },
    });
    return NextResponse.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, key: publicRazorpayKey(), planName: plan.name, user: { name: user.name, email: user.email, phone: user.phone } } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create payment order.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
