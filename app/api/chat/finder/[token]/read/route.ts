import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ token: string }> };
export async function PATCH(_request: Request, { params }: Context) {
  const { token } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { finderAccessToken: token }, select: { id: true } });
  if (!conversation) return NextResponse.json({ success: false, message: "Secure chat link is invalid." }, { status: 404 });
  await prisma.chatMessage.updateMany({ where: { conversationId: conversation.id, senderType: "OWNER", isReadByFinder: false }, data: { isReadByFinder: true } });
  return NextResponse.json({ success: true });
}
