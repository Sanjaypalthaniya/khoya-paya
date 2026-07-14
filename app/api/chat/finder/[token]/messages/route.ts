import { NextResponse } from "next/server";
import { sendOwnerChatReplyEmail } from "@/lib/email";
import { reportServerError } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { chatMessageSchema } from "@/lib/validations/chat";

type Context = { params: Promise<{ token: string }> };
export async function POST(request: Request, { params }: Context) {
  const { token } = await params;
  const limit = enforceRateLimit(request, `finder-chat:${token.slice(0, 12)}`, 12, 60_000);
  if (!limit.allowed) return NextResponse.json({ success: false, message: "Too many messages. Please wait a moment." }, { status: 429 });
  const parsed = chatMessageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message }, { status: 400 });
  const conversation = await prisma.conversation.findUnique({ where: { finderAccessToken: token }, include: { item: { select: { itemName: true } }, owner: { select: { id: true, name: true, email: true, emailAlertsEnabled: true, finderMessageAlertsEnabled: true } } } });
  if (!conversation) return NextResponse.json({ success: false, message: "Secure chat link is invalid." }, { status: 404 });
  if (conversation.status !== "OPEN") return NextResponse.json({ success: false, message: "This conversation is closed." }, { status: 409 });
  const now = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({ data: { conversationId: conversation.id, senderType: "FINDER", message: parsed.data.message, isReadByOwner: false, isReadByFinder: true } });
    await tx.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: now } });
    return created;
  });
  createNotification({ userId: conversation.ownerId, type: "FINDER_MESSAGE", title: "New secure chat reply", message: `A finder replied about "${conversation.item.itemName}".`, link: `/dashboard/chats/${conversation.id}`, metadata: { conversationId: conversation.id } }).catch((error) => reportServerError("chat-reply-notification", error));
  if (conversation.owner.emailAlertsEnabled && conversation.owner.finderMessageAlertsEnabled) {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    sendOwnerChatReplyEmail({ ownerEmail: conversation.owner.email, ownerName: conversation.owner.name, itemName: conversation.item.itemName, dashboardUrl: `${baseUrl}/dashboard/chats/${conversation.id}` }).catch((error) => reportServerError("owner-chat-reply-email", error));
  }
  return NextResponse.json({ success: true, data: { message: { ...message, createdAt: message.createdAt.toISOString() } } }, { status: 201 });
}
