import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateMissingQrCodes } from "@/lib/bulk";
import { requireBusinessPlan } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const access = await requireBusinessPlan(user.id);
  if (!access.success) return NextResponse.json(access, { status: 403 });

  const body = await request.json();
  const generateForAllMissing = Boolean(body.generateForAllMissing);
  const itemIds = Array.isArray(body.itemIds) ? body.itemIds.filter((id: unknown) => typeof id === "string") : [];

  const ids = generateForAllMissing
    ? (await prisma.item.findMany({ where: { userId: user.id, qrCode: null }, select: { id: true } })).map((item) => item.id)
    : itemIds;

  if (!ids.length) return NextResponse.json({ success: false, message: "No items selected." }, { status: 400 });

  const result = await generateMissingQrCodes(ids, user.id);
  return NextResponse.json({ success: true, message: "Bulk QR generation completed.", data: result });
}
