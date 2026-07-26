import "server-only";

import { prisma } from "@/lib/prisma";
import { MobileTokenError, verifyMobileAccessToken } from "./tokens";

export class MobileAuthenticationError extends Error {
  constructor(public readonly code: "AUTHENTICATION_REQUIRED" | "TOKEN_EXPIRED" | "SESSION_REVOKED" | "ACCOUNT_BLOCKED") {
    super(code);
  }
}

export async function requireMobileAuthentication(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new MobileAuthenticationError("AUTHENTICATION_REQUIRED");
  }
  try {
    const claims = await verifyMobileAccessToken(authorization.slice(7).trim());
    const session = await prisma.mobileSession.findUnique({
      where: { id: claims.sessionId },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, role: true, isBlocked: true,
            emailVerifiedAt: true, mobileVerifiedAt: true, verificationLevel: true,
          },
        },
      },
    });
    if (!session || session.userId !== claims.userId || session.revokedAt || session.expiresAt <= new Date()) {
      throw new MobileAuthenticationError("SESSION_REVOKED");
    }
    if (session.user.isBlocked) throw new MobileAuthenticationError("ACCOUNT_BLOCKED");
    return { claims, session, user: session.user };
  } catch (error) {
    if (error instanceof MobileAuthenticationError) throw error;
    if (error instanceof MobileTokenError) throw new MobileAuthenticationError(error.code);
    throw new MobileAuthenticationError("AUTHENTICATION_REQUIRED");
  }
}
