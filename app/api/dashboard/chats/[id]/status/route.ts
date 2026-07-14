import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conversationStatusSchema } from "@/lib/validations/chat";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const parsed = conversationStatusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid conversation status." }, { status: 400 });
  const result = await prisma.conversation.updateMany({ where: { id, ownerId: user.id }, data: { status: parsed.data.status } });
  if (!result.count) return NextResponse.json({ success: false, message: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: { status: parsed.data.status } });
}
