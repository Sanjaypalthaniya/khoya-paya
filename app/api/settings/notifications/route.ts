import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const phone = z.string().trim().regex(/^\+?[0-9]{8,15}$/, "Enter a valid phone number").optional().or(z.literal(""));
const preferencesSchema = z.object({
  emailAlertsEnabled: z.boolean(),
  whatsappAlertsEnabled: z.boolean(),
  smsAlertsEnabled: z.boolean(),
  qrScanAlertsEnabled: z.boolean(),
  finderMessageAlertsEnabled: z.boolean(),
  paymentAlertsEnabled: z.boolean(),
  whatsappNumber: phone,
  smsNumber: phone,
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const preferences = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      emailAlertsEnabled: true,
      whatsappAlertsEnabled: true,
      smsAlertsEnabled: true,
      qrScanAlertsEnabled: true,
      finderMessageAlertsEnabled: true,
      paymentAlertsEnabled: true,
      whatsappNumber: true,
      smsNumber: true,
    },
  });

  return NextResponse.json({ success: true, message: "Notification preferences loaded.", data: { preferences } });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const parsed = preferencesSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid preferences." }, { status: 400 });
  }

  const preferences = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...parsed.data,
      whatsappNumber: parsed.data.whatsappNumber || null,
      smsNumber: parsed.data.smsNumber || null,
    },
    select: {
      emailAlertsEnabled: true,
      whatsappAlertsEnabled: true,
      smsAlertsEnabled: true,
      qrScanAlertsEnabled: true,
      finderMessageAlertsEnabled: true,
      paymentAlertsEnabled: true,
      whatsappNumber: true,
      smsNumber: true,
    },
  });

  return NextResponse.json({ success: true, message: "Notification preferences saved.", data: { preferences } });
}
