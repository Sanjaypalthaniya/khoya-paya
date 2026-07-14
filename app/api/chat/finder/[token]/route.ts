import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ token: string }> };
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: Context) {
  const { token } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { finderAccessToken: token },
    include: { item: { select: { itemName: true, category: true } }, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return NextResponse.json({ success: false, message: "Secure chat link is invalid." }, { status: 404 });
  return NextResponse.json({ success: true, data: { conversation: {
    id: conversation.id, status: conversation.status, finderName: conversation.finderName, item: conversation.item,
    messages: conversation.messages.map((message) => ({ id: message.id, senderType: message.senderType, message: message.message, isReadByFinder: message.isReadByFinder, createdAt: message.createdAt.toISOString() })),
  } } });
}
