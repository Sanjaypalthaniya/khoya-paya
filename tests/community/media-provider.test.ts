import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMediaProviderResult } from "../../lib/moderation/providers";

const input = {
  mediaType: "IMAGE" as const,
  mediaUrl: "https://example.invalid/image.jpg",
  altText: "Wallet post media",
  selectedCategory: "WALLET",
  contentHash: "hash",
};

test("self-hosted category mismatch is routed to review with a clear reason", () => {
  const result = normalizeMediaProviderResult(
    {
      decision: "APPROVED",
      riskScore: 0.1,
      reasonCode: "SAFE",
      userMessage: "Safe",
      signals: [],
      detectedLabels: ["bicycle"],
      categoryMatch: false,
    },
    "test-provider",
    input,
  );
  assert.equal(result.decision, "UNDER_REVIEW");
  assert.equal(result.reasonCode, "CATEGORY_MISMATCH");
  assert.match(result.userMessage, /does not appear to match/i);
});

test("malformed provider output fails closed instead of being trusted", () => {
  assert.throws(() =>
    normalizeMediaProviderResult(
      { decision: "APPROVED" },
      "test-provider",
      input,
    ),
  );
});
