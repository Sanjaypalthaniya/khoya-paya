import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markNotificationRead } from "@/lib/notifications";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await markNotificationRead(user.id, id);
  return NextResponse.json({ success: true, message: "Notification marked as read." });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await (await import("@/lib/prisma")).prisma.notification.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true, message: "Notification deleted." });
}
