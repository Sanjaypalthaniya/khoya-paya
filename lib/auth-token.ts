import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE_NAME = "khoya_paya_session";

export type AuthTokenPayload = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createToken(payload: AuthTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  return {
    id: String(payload.id),
    email: String(payload.email),
    name: String(payload.name),
    role: payload.role === "ADMIN" ? "ADMIN" : "USER",
  } satisfies AuthTokenPayload;
}
