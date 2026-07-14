import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureConversationForFinderMessage, getFinderChatUrl } from "@/lib/chat";

type Context = { params: Promise<{ id: string }> };
export async function POST(_request: Request, { params }: Context) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const conversation = await ensureConversationForFinderMessage(id, user.id);
  if (!conversation) return NextResponse.json({ success: false, message: "Finder message not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: { conversationId: conversation.id, finderChatUrl: getFinderChatUrl(conversation.finderAccessToken) } });
}
