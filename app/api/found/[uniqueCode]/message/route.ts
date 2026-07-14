import { NextRequest, NextResponse } from "next/server";
import { finderMessageSchema } from "@/lib/validations/finderMessage";
import { rateLimitResponse } from "@/lib/api-response";
import { sendFinderMessageEmail } from "@/lib/email";
import { createFinderMessageNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { sendSMSNotification } from "@/lib/sms";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { enforceRateLimit } from "@/lib/rate-limit";
import { reportServerError } from "@/lib/logger";
import { ensureConversationForFinderMessage } from "@/lib/chat";

type RouteContext = {
  params: Promise<{ uniqueCode: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { uniqueCode } = await params;
    const parsed = finderMessageSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid message details." },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ success: true, message: "Message sent safely." });
    }

    const rateLimit = enforceRateLimit(request, `finder-message:${uniqueCode}`, 5, 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse();

    const qrCode = await prisma.qRCode.findUnique({
      where: { uniqueCode },
      select: {
        itemId: true,
        item: {
          select: {
            itemName: true,
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailAlertsEnabled: true,
                whatsappAlertsEnabled: true,
                smsAlertsEnabled: true,
                finderMessageAlertsEnabled: true,
                whatsappNumber: true,
                smsNumber: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json({ success: false, message: "QR code not found." }, { status: 404 });
    }

    const { finderMessage, conversation } = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.finderMessage.create({
        data: {
          itemId: qrCode.itemId,
          finderName: parsed.data.finderName || null,
          finderPhone: parsed.data.finderPhone || null,
          finderEmail: parsed.data.finderEmail || null,
          finderMessage: parsed.data.finderMessage,
          finderLocation: parsed.data.finderLocation || null,
          finderPhotoUrl: parsed.data.finderPhotoUrl || null,
          status: "NEW",
        },
      });
      const createdConversation = await ensureConversationForFinderMessage(createdMessage.id, qrCode.item.user.id, tx);
      if (!createdConversation) throw new Error("Unable to create secure conversation.");
      return { finderMessage: createdMessage, conversation: createdConversation };
    });

    const owner = qrCode.item.user;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/messages`;

    if (owner.finderMessageAlertsEnabled) {
      createFinderMessageNotification({
        userId: owner.id,
        itemId: qrCode.itemId,
        itemName: qrCode.item.itemName,
        finderMessageId: finderMessage.id,
      }).catch((error) => reportServerError("finder-message-notification", error));
    }

    if (owner.emailAlertsEnabled && owner.finderMessageAlertsEnabled) {
      sendFinderMessageEmail({
        ownerEmail: owner.email,
        ownerName: owner.name,
        itemName: qrCode.item.itemName,
        category: qrCode.item.category,
        finderName: parsed.data.finderName,
        finderPhone: parsed.data.finderPhone,
        finderEmail: parsed.data.finderEmail,
        finderMessage: parsed.data.finderMessage,
        finderLocation: parsed.data.finderLocation,
      }).catch((error) => {
        reportServerError("finder-message-email", error);
      });
    }

    if (owner.whatsappAlertsEnabled && owner.finderMessageAlertsEnabled) {
      sendWhatsAppNotification({
        to: owner.whatsappNumber,
        message: `New alert from Khoya Paya\n\nSomeone found your item:\nItem: ${qrCode.item.itemName}\nMessage: ${parsed.data.finderMessage.slice(0, 180)}\n\nOpen dashboard:\n${dashboardUrl}`,
      }).catch((error) => reportServerError("finder-message-whatsapp", error));
    }

    if (owner.smsAlertsEnabled && owner.finderMessageAlertsEnabled) {
      sendSMSNotification({
        to: owner.smsNumber,
        message: `Khoya Paya: New finder message for ${qrCode.item.itemName}. Check dashboard: ${dashboardUrl}`,
      }).catch((error) => reportServerError("finder-message-sms", error));
    }

    return NextResponse.json({
      success: true,
      message: "Thank you. Your message has been sent safely to the owner.",
      data: { finderChatToken: conversation.finderAccessToken },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to send message." }, { status: 500 });
  }
}
