import { NextResponse } from "next/server";
import { abuseReportSchema } from "@/lib/validations/abuseReport";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ uniqueCode: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { uniqueCode } = await params;
    const rateLimit = enforceRateLimit(request, `abuse-report:${uniqueCode}`, 5, 60 * 1000);
    if (!rateLimit.allowed) return rateLimitResponse();

    const parsed = abuseReportSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid report details." },
        { status: 400 },
      );
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { uniqueCode },
      select: { itemId: true },
    });

    if (!qrCode) {
      return NextResponse.json({ success: false, message: "QR code not found." }, { status: 404 });
    }

    await prisma.abuseReport.create({
      data: {
        itemId: qrCode.itemId,
        reportReason: parsed.data.reportReason,
        reportedBy: parsed.data.reportedBy || null,
      },
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully." });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to submit report." }, { status: 500 });
  }
}
