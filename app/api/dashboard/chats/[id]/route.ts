import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFinderChatUrl } from "@/lib/chat";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const conversation = await prisma.conversation.findFirst({
    where: { id, ownerId: user.id },
    include: { item: { select: { itemName: true, category: true } }, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: { conversation: {
    id: conversation.id, status: conversation.status, finderName: conversation.finderName, finderPhone: conversation.finderPhone,
    finderEmail: conversation.finderEmail, finderChatUrl: getFinderChatUrl(conversation.finderAccessToken), item: conversation.item,
    messages: conversation.messages.map((message) => ({ ...message, createdAt: message.createdAt.toISOString() })),
  } } });
}
