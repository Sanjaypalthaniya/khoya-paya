import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusUpdateSchema } from "@/lib/validations/item";
import { updateItemWithCommunityIntegration } from "@/lib/items/community-integration";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const parsed = statusUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid status." }, { status: 400 });

  const item = await prisma.item.findFirst({ where: { id, userId: user.id, deletedAt: null }, select: { id: true } });
  if (!item) return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });

  try {
    const updated = await updateItemWithCommunityIntegration(user.id, id, {
      status: parsed.data.status,
      lostModeEnabled: parsed.data.status === "LOST",
      publicSearchVisible: ["LOST", "FOUND", "MISSING"].includes(parsed.data.status),
    }, parsed.data.publishToCommunity);
    return NextResponse.json({ success: true, message: "Item and Community Feed status updated.", data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to update status." }, { status: 400 });
  }
}
