import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluatePostPublicationEligibility,
  getPublicMediaEligibilityFilter,
  isPublicMediaEligible,
  PUBLIC_POST_WHERE,
} from "../../lib/community/publication";
const media = (
  processingStatus: "READY" | "FAILED" | "PROCESSING",
  moderationStatus: "APPROVED" | "PENDING" | "REJECTED",
) => ({ processingStatus, moderationStatus, deletedAt: null });
test("public media filter requires ready, approved, and not deleted", () => {
  const filter = getPublicMediaEligibilityFilter();
  assert.equal(filter.processingStatus, "READY");
  assert.equal(filter.moderationStatus, "APPROVED");
  assert.equal(filter.deletedAt, null);
  assert.ok(filter.post);
});
test("pending, rejected, and failed media are ineligible", () => {
  assert.equal(isPublicMediaEligible(media("READY", "PENDING")), false);
  assert.equal(isPublicMediaEligible(media("READY", "REJECTED")), false);
  assert.equal(isPublicMediaEligible(media("FAILED", "APPROVED")), false);
});
test("approved ready media is eligible", () =>
  assert.equal(isPublicMediaEligible(media("READY", "APPROVED")), true));
test("approved text publishes while pending or rejected media stays hidden", () => {
  for (const status of ["PENDING", "REJECTED"] as const) {
    const result = evaluatePostPublicationEligibility({
      textModerationStatus: "APPROVED",
      media: [media("READY", status)],
      visibility: "PUBLIC",
    });
    assert.equal(result.eligible, true);
  }
});
test("post without media publishes after approved text", () =>
  assert.equal(
    evaluatePostPublicationEligibility({
      textModerationStatus: "APPROVED",
      media: [],
      visibility: "PUBLIC",
    }).eligible,
    true,
  ));
test("public parent filter does not hide safe text while media is reviewed", () =>
  assert.equal("media" in PUBLIC_POST_WHERE, false));
