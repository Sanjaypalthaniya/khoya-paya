import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { ownerId: user.id },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    include: {
      item: { select: { itemName: true, category: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { senderType: "FINDER", isReadByOwner: false } } } },
    },
  });

  return NextResponse.json({ success: true, data: { conversations: conversations.map((conversation) => ({
    id: conversation.id,
    itemName: conversation.item.itemName,
    itemCategory: conversation.item.category,
    finderName: conversation.finderName,
    finderPhone: conversation.finderPhone,
    finderEmail: conversation.finderEmail,
    status: conversation.status,
    lastMessage: conversation.messages[0]?.message ?? null,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    unreadCount: conversation._count.messages,
  })) } });
}
