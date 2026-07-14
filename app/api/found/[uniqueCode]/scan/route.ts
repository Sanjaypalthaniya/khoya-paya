import { NextRequest, NextResponse } from "next/server";
import { createQrScanNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestIp, getUserAgent } from "@/lib/request";
import { reportServerError } from "@/lib/logger";

type RouteContext = {
  params: Promise<{ uniqueCode: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { uniqueCode } = await params;
    const rateLimit = enforceRateLimit(request, `qr-scan:${uniqueCode}`, 60, 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, message: "Too many scan requests." }, { status: 429 });

    const qrCode = await prisma.qRCode.findUnique({
      where: { uniqueCode },
      select: {
        id: true,
        itemId: true,
        item: {
          select: {
            id: true,
            itemName: true,
            lostModeEnabled: true,
            userId: true,
            user: { select: { qrScanAlertsEnabled: true } },
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json({ success: false, message: "QR code not found." }, { status: 404 });
    }

    await prisma.scanLog.create({
      data: {
        itemId: qrCode.itemId,
        qrCodeId: qrCode.id,
        ipAddress: getRequestIp(request),
        userAgent: getUserAgent(request),
        location: null,
      },
    });

    if (qrCode.item.lostModeEnabled && qrCode.item.user.qrScanAlertsEnabled) {
      const cooldownSince = new Date(Date.now() - 10 * 60 * 1000);
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: qrCode.item.userId,
          type: "QR_SCAN",
          createdAt: { gte: cooldownSince },
          metadata: { path: ["itemId"], equals: qrCode.item.id },
        },
        select: { id: true },
      });

      if (!recentNotification) {
        createQrScanNotification({
          userId: qrCode.item.userId,
          itemId: qrCode.item.id,
          itemName: qrCode.item.itemName,
        }).catch((error) => reportServerError("qr-scan-notification", error));
      }
    }

    return NextResponse.json({ success: true, message: "Scan logged successfully." });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to log scan." }, { status: 500 });
  }
}
