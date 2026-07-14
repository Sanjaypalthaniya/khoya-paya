import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(_request: Request, { params }: Context) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const conversation = await prisma.conversation.findFirst({ where: { id, ownerId: user.id }, select: { id: true } });
  if (!conversation) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });
  await prisma.chatMessage.updateMany({ where: { conversationId: id, senderType: "FINDER", isReadByOwner: false }, data: { isReadByOwner: true } });
  return NextResponse.json({ success: true });
}
