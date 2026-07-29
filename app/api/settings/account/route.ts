import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, getCurrentUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  password: z.string().min(1, "Current password is required."),
  reason: z.enum(["NOT_USING", "PRIVACY", "MISSING_FEATURES", "TOO_DIFFICULT", "OTHER"]),
  feedback: z.string().trim().max(500).optional(),
  confirmation: z.literal("DELETE"),
  understandsPermanent: z.literal(true),
});

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.isBlocked) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Complete every confirmation step." }, { status: 400 });
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!account || !(await comparePassword(parsed.data.password, account.passwordHash))) {
    return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 403 });
  }
  await prisma.user.delete({ where: { id: user.id } });
  const response = NextResponse.json({ success: true, message: "Account permanently deleted." });
  response.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
