import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyCheckoutSignature } from "@/lib/payments/razorpay-signatures";
import { activatePaidOrder } from "@/lib/payments/service";

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
  if (!verifyCheckoutSignature(parsed.data.razorpay_order_id, parsed.data.razorpay_payment_id, parsed.data.razorpay_signature, secret)) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return NextResponse.json({ success: false, message: "Payment signature verification failed." }, { status: 400 });
  }

  const result = await prisma.$transaction(tx => activatePaidOrder(tx, parsed.data.razorpay_order_id, parsed.data.razorpay_payment_id, parsed.data.razorpay_signature));
  return NextResponse.json({ success: true, message: "Payment verified and plan activated.", data: { subscription: result } });
}
