import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const statusSchema = z.object({
  status: z.enum(["NEW", "READ", "RESOLVED", "SPAM"]),
});

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.isBlocked) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const parsed = statusSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid message status." }, { status: 400 });
  }

  const message = await prisma.finderMessage.findFirst({
    where: { id, item: { userId: user.id } },
    select: { id: true },
  });

  if (!message) {
    return NextResponse.json({ success: false, message: "Message not found." }, { status: 404 });
  }

  const updated = await prisma.finderMessage.update({
    where: { id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ success: true, message: "Message status updated.", messageStatus: updated });
}
