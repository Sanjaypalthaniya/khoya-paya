import assert from "node:assert/strict";
import crypto from "crypto";
import test from "node:test";
import { verifyCheckoutSignature, verifyWebhookSignature, webhookPayloadHash } from "../../lib/payments/razorpay-signatures";

test("checkout signature accepts authentic payload and rejects tampering", () => {
  const secret = "test-secret"; const order = "order_123"; const payment = "pay_123";
  const signature = crypto.createHmac("sha256", secret).update(`${order}|${payment}`).digest("hex");
  assert.equal(verifyCheckoutSignature(order, payment, signature, secret), true);
  assert.equal(verifyCheckoutSignature(order, "pay_wrong", signature, secret), false);
  assert.equal(verifyCheckoutSignature(order, payment, "invalid", secret), false);
});

test("webhook signature verifies the exact raw body", () => {
  const secret = "webhook-secret"; const raw = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } });
  const signature = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  assert.equal(verifyWebhookSignature(raw, signature, secret), true);
  assert.equal(verifyWebhookSignature(`${raw} `, signature, secret), false);
  assert.equal(webhookPayloadHash(raw), webhookPayloadHash(raw));
});
