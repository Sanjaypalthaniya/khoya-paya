import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.isBlocked) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.finderMessage.findMany({
    where: { item: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      item: { select: { itemName: true, category: true } },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Finder messages loaded.",
    messages: messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}
