import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/auth-token";

export { createToken, SESSION_COOKIE_NAME, verifyToken } from "@/lib/auth-token";

export async function hashPassword(password: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, passwordHash: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, passwordHash);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getCurrentUser() {
  const { cookies } = await import("next/headers");
  const { prisma } = await import("@/lib/prisma");
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);

    return prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
}
