import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

process.env.MOBILE_ACCESS_TOKEN_SECRET = "local-test-access-secret-32-characters-minimum";
process.env.MOBILE_REFRESH_TOKEN_PEPPER = "local-test-refresh-pepper-different-32-chars";

test("refresh tokens are random and only deterministic hashes are persisted", async () => {
  const { createRefreshToken, hashRefreshToken } = await import("../../lib/server/mobile-api/tokens");
  const first = createRefreshToken();
  const second = createRefreshToken();
  assert.notEqual(first, second);
  assert.equal(hashRefreshToken(first), hashRefreshToken(first));
  assert.notEqual(hashRefreshToken(first), first);
  assert.equal(hashRefreshToken(first).length, 64);
});

test("mobile access tokens contain minimal typed claims and expire", async () => {
  const { createMobileAccessToken, verifyMobileAccessToken } = await import("../../lib/server/mobile-api/tokens");
  const issued = await createMobileAccessToken({ userId: "user-1", role: "USER", sessionId: "session-1" });
  const claims = await verifyMobileAccessToken(issued.token);
  assert.deepEqual(claims, { userId: "user-1", role: "USER", sessionId: "session-1" });
  assert.ok(issued.expiresAt > new Date());
  assert.equal(issued.token.includes("user@example.com"), false);
});

test("mobile login validates email and device metadata", async () => {
  const { mobileLoginSchema } = await import("../../lib/server/mobile-api/validation");
  assert.equal(mobileLoginSchema.safeParse({
    identifier: "person@example.com",
    password: "secret-password",
    device: { deviceId: "installation-123", platform: "android", appVersion: "0.1.0" },
  }).success, true);
  assert.equal(mobileLoginSchema.safeParse({
    identifier: "not-email",
    password: "",
    device: { deviceId: "x", platform: "web" },
  }).success, false);
});

test("migration is additive and never stores a raw refresh token", () => {
  const sql = readFileSync(path.join(process.cwd(), "prisma/migrations/20260726170000_mobile_sessions/migration.sql"), "utf8");
  assert.doesNotMatch(sql, /\b(DROP|TRUNCATE|DELETE\s+FROM|ALTER\s+TABLE\s+"User")\b/i);
  assert.match(sql, /"refreshTokenHash"/);
  assert.doesNotMatch(sql, /"refreshToken"\s+TEXT/);
});

test("website auth cookie contract and routes remain preserved", () => {
  const auth = readFileSync(path.join(process.cwd(), "lib/auth.ts"), "utf8");
  const token = readFileSync(path.join(process.cwd(), "lib/auth-token.ts"), "utf8");
  const logout = readFileSync(path.join(process.cwd(), "app/api/auth/logout/route.ts"), "utf8");
  assert.match(token, /khoya_paya_session/);
  assert.match(auth, /httpOnly:\s*true/);
  assert.match(auth, /sameSite:\s*"lax"/);
  assert.match(auth, /maxAge:\s*60 \* 60 \* 24 \* 7/);
  assert.match(logout, /SESSION_COOKIE_NAME/);
});

test("mobile endpoints never set or clear the website cookie", () => {
  const routeRoot = path.join(process.cwd(), "app/api/v1/auth");
  const sources = ["login", "refresh", "logout", "logout-all", "me"]
    .map((name) => readFileSync(path.join(routeRoot, name, "route.ts"), "utf8"))
    .join("\n");
  assert.doesNotMatch(sources, /SESSION_COOKIE_NAME|response\.cookies|cookies\(\)/);
});
