import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFinderChatUrl } from "@/lib/chat";
import { sendFinderChatLinkEmail } from "@/lib/email";
import { reportServerError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatMessageSchema } from "@/lib/validations/chat";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const parsed = chatMessageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message }, { status: 400 });
  const conversation = await prisma.conversation.findFirst({ where: { id, ownerId: user.id }, include: { item: { select: { itemName: true } } } });
  if (!conversation) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });
  if (conversation.status !== "OPEN") return NextResponse.json({ success: false, message: "Reopen the conversation before replying." }, { status: 409 });
  const previousOwnerReplies = await prisma.chatMessage.count({ where: { conversationId: id, senderType: "OWNER" } });
  const now = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({ data: { conversationId: id, senderType: "OWNER", senderUserId: user.id, message: parsed.data.message, isReadByOwner: true, isReadByFinder: false } });
    await tx.conversation.update({ where: { id }, data: { lastMessageAt: now } });
    return created;
  });
  if (previousOwnerReplies === 0 && conversation.finderEmail) {
    sendFinderChatLinkEmail({ finderEmail: conversation.finderEmail, finderName: conversation.finderName, itemName: conversation.item.itemName, chatUrl: getFinderChatUrl(conversation.finderAccessToken) }).catch((error) => reportServerError("finder-chat-link-email", error));
  }
  return NextResponse.json({ success: true, data: { message: { ...message, createdAt: message.createdAt.toISOString() } } }, { status: 201 });
}
