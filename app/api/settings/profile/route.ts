import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().regex(/^\+?[0-9]{8,15}$/).optional().or(z.literal("")) });

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid profile." }, { status: 400 });
  const profile = await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null }, select: { name: true, email: true, phone: true } });
  return NextResponse.json({ success: true, message: "Profile saved.", data: { profile } });
}
