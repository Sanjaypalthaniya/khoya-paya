import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { hashPasswordResetToken } from "@/lib/password-reset";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
  confirmPassword: z.string(),
}).refine(value => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, "reset-password", 8, 15 * 60 * 1000);
  if (!rateLimit.allowed) return NextResponse.json({ success: false, message: "Too many attempts. Please wait and try again." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? "Invalid password." }, { status: 400 });

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashPasswordResetToken(parsed.data.token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return NextResponse.json({ success: false, message: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } }),
    prisma.mobileSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: "password_reset" } }),
  ]);

  return NextResponse.json({ success: true, message: "Password updated. You can now log in." });
}
