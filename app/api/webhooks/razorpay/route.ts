import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportServerError } from "@/lib/logger";
import { activatePaidOrder, markOrderFailed, markOrderRefunded } from "@/lib/payments/service";
import { verifyWebhookSignature, webhookPayloadHash } from "@/lib/payments/razorpay-signatures";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RazorpayPayload = { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } }; order?: { entity?: { id?: string } }; refund?: { entity?: { payment_id?: string } } } };

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ success: false, message: "Webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, signature, secret)) return NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 401 });

  let body: RazorpayPayload;
  try { body = JSON.parse(rawBody) as RazorpayPayload; } catch { return NextResponse.json({ success: false, message: "Invalid webhook payload." }, { status: 400 }); }
  const eventType = body.event ?? "unknown";
  const hash = webhookPayloadHash(rawBody);
  const paymentEntity = body.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id ?? body.payload?.order?.entity?.id;
  const paymentId = paymentEntity?.id;
  const providerEventId = request.headers.get("x-razorpay-event-id") ?? `${eventType}:${orderId ?? paymentId ?? hash}`;

  const existing = await prisma.paymentWebhookEvent.findUnique({ where: { provider_providerEventId: { provider: "RAZORPAY", providerEventId } } });
  if (existing?.status === "PROCESSED" || existing?.status === "IGNORED") return NextResponse.json({ success: true, duplicate: true });
  const record = existing
    ? await prisma.paymentWebhookEvent.update({ where: { id: existing.id }, data: { attemptCount: { increment: 1 }, status: "RECEIVED", lastError: null } })
    : await prisma.paymentWebhookEvent.create({ data: { provider: "RAZORPAY", providerEventId, eventType, payloadHash: hash } });

  try {
    const handled = await prisma.$transaction(async tx => {
      if (["payment.captured", "order.paid"].includes(eventType) && orderId && paymentId) { await activatePaidOrder(tx, orderId, paymentId); return true; }
      if (eventType === "payment.failed" && orderId) { await markOrderFailed(tx, orderId); return true; }
      if (["refund.created", "refund.processed"].includes(eventType)) {
        const providerPaymentId = body.payload?.refund?.entity?.payment_id;
        if (providerPaymentId) { const payment = await tx.payment.findFirst({ where: { razorpayPaymentId: providerPaymentId }, select: { razorpayOrderId: true } }); if (payment) await markOrderRefunded(tx, payment.razorpayOrderId); }
        return true;
      }
      return false;
    });
    await prisma.paymentWebhookEvent.update({ where: { id: record.id }, data: { status: handled ? "PROCESSED" : "IGNORED", processedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const safeError = error instanceof Error ? error.message.slice(0, 500) : "Webhook processing failed";
    await prisma.paymentWebhookEvent.update({ where: { id: record.id }, data: { status: "FAILED", failedAt: new Date(), lastError: safeError } });
    reportServerError("razorpay-webhook", error);
    return NextResponse.json({ success: false, message: "Webhook processing failed." }, { status: 500 });
  }
}
