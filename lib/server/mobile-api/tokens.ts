import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify, errors as joseErrors } from "jose";

export type MobileAccessClaims = {
  userId: string;
  role: "USER" | "ADMIN";
  sessionId: string;
};

function requiredSecret(name: "MOBILE_ACCESS_TOKEN_SECRET" | "MOBILE_REFRESH_TOKEN_PEPPER") {
  const value = process.env[name];
  if (!value || value.length < 32) throw new Error(`${name} must contain at least 32 characters.`);
  return value;
}

export function accessTokenTtlMinutes() {
  const value = Number(process.env.MOBILE_ACCESS_TOKEN_TTL_MINUTES ?? "15");
  return Number.isInteger(value) && value >= 5 && value <= 60 ? value : 15;
}

export function refreshTokenTtlDays() {
  const value = Number(process.env.MOBILE_REFRESH_TOKEN_TTL_DAYS ?? "30");
  return Number.isInteger(value) && value >= 1 && value <= 90 ? value : 30;
}

export function assertMobileAuthConfiguration() {
  requiredSecret("MOBILE_ACCESS_TOKEN_SECRET");
  requiredSecret("MOBILE_REFRESH_TOKEN_PEPPER");
  accessTokenTtlMinutes();
  refreshTokenTtlDays();
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function createTokenFamily() {
  return randomUUID();
}

export function hashRefreshToken(token: string) {
  return createHmac("sha256", requiredSecret("MOBILE_REFRESH_TOKEN_PEPPER")).update(token).digest("hex");
}

export async function createMobileAccessToken(claims: MobileAccessClaims) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + accessTokenTtlMinutes() * 60_000);
  const token = await new SignJWT({
    role: claims.role,
    sid: claims.sessionId,
    typ: "mobile_access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt(Math.floor(issuedAt.getTime() / 1000))
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(new TextEncoder().encode(requiredSecret("MOBILE_ACCESS_TOKEN_SECRET")));
  return { token, expiresAt };
}

export async function verifyMobileAccessToken(token: string): Promise<MobileAccessClaims> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(requiredSecret("MOBILE_ACCESS_TOKEN_SECRET")),
    );
    if (payload.typ !== "mobile_access" || !payload.sub || typeof payload.sid !== "string") {
      throw new Error("Invalid mobile access token.");
    }
    return {
      userId: payload.sub,
      sessionId: payload.sid,
      role: payload.role === "ADMIN" ? "ADMIN" : "USER",
    };
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) throw new MobileTokenError("TOKEN_EXPIRED");
    throw new MobileTokenError("AUTHENTICATION_REQUIRED");
  }
}

export class MobileTokenError extends Error {
  constructor(public readonly code: "TOKEN_EXPIRED" | "AUTHENTICATION_REQUIRED") {
    super(code);
  }
}
