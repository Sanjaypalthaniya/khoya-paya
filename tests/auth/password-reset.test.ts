import assert from "node:assert/strict";
import test from "node:test";
import { createPasswordResetToken, hashPasswordResetToken, PASSWORD_RESET_TTL_MS } from "../../lib/password-reset";

test("password reset tokens are random, hashed, and short-lived", () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.token, first.tokenHash);
  assert.equal(first.tokenHash, hashPasswordResetToken(first.token));
  assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(PASSWORD_RESET_TTL_MS, 30 * 60 * 1000);
});
