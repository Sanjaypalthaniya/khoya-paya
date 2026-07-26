import "server-only";

import { prisma } from "@/lib/prisma";
import {
  assertMobileAuthConfiguration,
  createMobileAccessToken,
  createRefreshToken,
  createTokenFamily,
  hashRefreshToken,
  refreshTokenTtlDays,
} from "./tokens";
import { logMobileSecurityEvent } from "./security-log";

export class MobileSessionError extends Error {
  constructor(public readonly code: "REFRESH_TOKEN_INVALID" | "SESSION_REVOKED" | "TOKEN_EXPIRED" | "ACCOUNT_BLOCKED") {
    super(code);
  }
}

type DeviceInput = {
  deviceId: string;
  platform: "android" | "ios";
  deviceName?: string;
  appVersion?: string;
};

function refreshExpiry() {
  return new Date(Date.now() + refreshTokenTtlDays() * 86_400_000);
}

export async function createMobileSession(user: { id: string; role: "USER" | "ADMIN" }, device: DeviceInput) {
  assertMobileAuthConfiguration();
  const refreshToken = createRefreshToken();
  const refreshTokenExpiresAt = refreshExpiry();
  const session = await prisma.mobileSession.create({
    data: {
      userId: user.id,
      deviceId: device.deviceId,
      platform: device.platform,
      deviceName: device.deviceName,
      appVersion: device.appVersion,
      refreshTokenHash: hashRefreshToken(refreshToken),
      refreshTokenFamily: createTokenFamily(),
      expiresAt: refreshTokenExpiresAt,
    },
  });
  const access = await createMobileAccessToken({ userId: user.id, role: user.role, sessionId: session.id });
  return {
    sessionId: session.id,
    accessToken: access.token,
    refreshToken,
    accessTokenExpiresAt: access.expiresAt,
    refreshTokenExpiresAt,
  };
}

export async function rotateMobileSession(refreshToken: string, deviceId: string) {
  assertMobileAuthConfiguration();
  const tokenHash = hashRefreshToken(refreshToken);
  const existing = await prisma.mobileSession.findUnique({
    where: { refreshTokenHash: tokenHash },
    include: { user: { select: { id: true, role: true, isBlocked: true } } },
  });

  if (!existing) throw new MobileSessionError("REFRESH_TOKEN_INVALID");
  if (existing.revokedAt) {
    if (existing.revokeReason === "ROTATED") {
      await prisma.mobileSession.updateMany({
        where: { refreshTokenFamily: existing.refreshTokenFamily, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: "REPLAY_DETECTED" },
      });
      logMobileSecurityEvent("refresh_replay_detected", { userId: existing.userId, family: existing.refreshTokenFamily });
    }
    throw new MobileSessionError("SESSION_REVOKED");
  }
  if (existing.expiresAt <= new Date()) throw new MobileSessionError("TOKEN_EXPIRED");
  if (existing.deviceId !== deviceId) throw new MobileSessionError("REFRESH_TOKEN_INVALID");
  if (existing.user.isBlocked) throw new MobileSessionError("ACCOUNT_BLOCKED");

  const nextRefreshToken = createRefreshToken();
  const nextRefreshTokenExpiresAt = refreshExpiry();
  const next = await prisma.$transaction(async (tx) => {
    const revoked = await tx.mobileSession.updateMany({
      where: { id: existing.id, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: "ROTATED", lastUsedAt: new Date() },
    });
    if (revoked.count !== 1) throw new MobileSessionError("SESSION_REVOKED");
    return tx.mobileSession.create({
      data: {
        userId: existing.userId,
        deviceId: existing.deviceId,
        platform: existing.platform,
        deviceName: existing.deviceName,
        appVersion: existing.appVersion,
        refreshTokenHash: hashRefreshToken(nextRefreshToken),
        refreshTokenFamily: existing.refreshTokenFamily,
        expiresAt: nextRefreshTokenExpiresAt,
        lastUsedAt: new Date(),
      },
    });
  });
  const access = await createMobileAccessToken({
    userId: existing.userId,
    role: existing.user.role,
    sessionId: next.id,
  });
  logMobileSecurityEvent("refresh_success", { userId: existing.userId, sessionId: next.id });
  return {
    sessionId: next.id,
    accessToken: access.token,
    refreshToken: nextRefreshToken,
    accessTokenExpiresAt: access.expiresAt,
    refreshTokenExpiresAt: nextRefreshTokenExpiresAt,
  };
}

export async function revokeMobileSession(sessionId: string, userId: string) {
  await prisma.mobileSession.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date(), revokeReason: "LOGOUT" },
  });
}

export async function revokeAllMobileSessions(userId: string) {
  const result = await prisma.mobileSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revokeReason: "LOGOUT_ALL" },
  });
  return result.count;
}
