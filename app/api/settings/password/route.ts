import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128) }).refine(value => value.currentPassword !== value.newPassword, { message: "Choose a different new password." });

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid password." }, { status: 400 });
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!record || !(await comparePassword(parsed.data.currentPassword, record.passwordHash))) return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return NextResponse.json({ success: true, message: "Password updated." });
}
