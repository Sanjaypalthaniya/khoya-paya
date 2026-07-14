import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ success: true, message: "Unread count loaded.", data: { count: await getUnreadNotificationCount(user.id) } });
}
