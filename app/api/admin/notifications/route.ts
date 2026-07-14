import { NotificationType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const read = searchParams.get("read");
  const email = searchParams.get("email");

  const notifications = await prisma.notification.findMany({
    where: {
      ...(type && Object.values(NotificationType).includes(type as NotificationType) ? { type: type as NotificationType } : {}),
      ...(read === "true" ? { isRead: true } : read === "false" ? { isRead: false } : {}),
      ...(email ? { user: { email: { contains: email, mode: "insensitive" } } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ success: true, message: "Admin notifications loaded.", data: { notifications } });
}
