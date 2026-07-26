import crypto from "crypto";

function safeEqualHex(expected: string, supplied: string) {
  if (!/^[a-f0-9]+$/i.test(supplied) || expected.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(supplied, "hex"));
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

export function webhookPayloadHash(rawBody: string) {
  return crypto.createHash("sha256").update(rawBody).digest("hex");
}
