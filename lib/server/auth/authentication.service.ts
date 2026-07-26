import "server-only";

import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";

export type AuthenticatedUserDTO = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  mobileVerified: boolean;
  verificationLevel: string | null;
};

export class AuthenticationError extends Error {
  constructor(
    public readonly code: "INVALID_CREDENTIALS" | "ACCOUNT_BLOCKED" | "ACCOUNT_SUSPENDED",
    message: string,
  ) {
    super(message);
  }
}

export function normalizeLoginIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export async function findUserForAuthentication(identifier: string) {
  return prisma.user.findUnique({
    where: { email: normalizeLoginIdentifier(identifier) },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      isBlocked: true,
      postingRestrictedUntil: true,
      emailVerifiedAt: true,
      mobileVerifiedAt: true,
      verificationLevel: true,
    },
  });
}

export async function verifyPassword(password: string, passwordHash: string) {
  return comparePassword(password, passwordHash);
}

export function ensureUserCanAuthenticate(user: {
  isBlocked: boolean;
  postingRestrictedUntil: Date | null;
}) {
  if (user.isBlocked) {
    throw new AuthenticationError("ACCOUNT_BLOCKED", "Your account is blocked. Please contact support.");
  }
  // Posting restrictions are moderation-scoped and do not suspend login.
}

export function createSafeAuthenticatedUserDTO(user: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerifiedAt: Date | null;
  mobileVerifiedAt: Date | null;
  verificationLevel: string | null;
}): AuthenticatedUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
    mobileVerified: Boolean(user.mobileVerifiedAt),
    verificationLevel: user.verificationLevel,
  };
}

export async function verifyUserCredentials(identifier: string, password: string) {
  const user = await findUserForAuthentication(identifier);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AuthenticationError("INVALID_CREDENTIALS", "The provided login details are incorrect.");
  }
  ensureUserCanAuthenticate(user);
  return user;
}

export async function recordSuccessfulLogin(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } });
}
