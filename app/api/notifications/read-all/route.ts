import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/notifications";

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await markAllNotificationsRead(user.id);
  return NextResponse.json({ success: true, message: "All notifications marked as read." });
}
