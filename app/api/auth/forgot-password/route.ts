import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createPasswordResetToken, PASSWORD_RESET_TTL_MS } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { reportServerError } from "@/lib/logger";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address.").toLowerCase() });
const genericMessage = "If an account exists for that email, a password reset link has been sent.";

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, "forgot-password", 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) return NextResponse.json({ success: true, message: genericMessage });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true, isBlocked: true },
  });

  if (user && !user.isBlocked) {
    const { token, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
    ]);
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`,
      });
    } catch (error) {
      reportServerError("password-reset-email", error);
    }
  }

  return NextResponse.json({ success: true, message: genericMessage });
}
