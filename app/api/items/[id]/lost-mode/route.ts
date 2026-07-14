import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lostModeSchema } from "@/lib/validations/item";
import { hasPaidPlan } from "@/lib/plans";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const parsed = lostModeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid lost mode value." }, { status: 400 });
  if (parsed.data.lostModeEnabled && !await hasPaidPlan(user.id)) return NextResponse.json({ success: false, code: "PREMIUM_REQUIRED", message: "Lost Mode requires Premium or Business plan." }, { status: 403 });

  const item = await prisma.item.findFirst({ where: { id, userId: user.id }, select: { id: true, status: true } });
  if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  const updated = await prisma.item.update({
    where: { id },
    data: {
      lostModeEnabled: parsed.data.lostModeEnabled,
      status: parsed.data.lostModeEnabled ? "LOST" : item.status === "LOST" ? "SAFE" : item.status,
    },
  });

  return NextResponse.json({ success: true, message: "Lost Mode updated.", data: { item: updated } });
}
