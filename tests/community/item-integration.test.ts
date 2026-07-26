import test from "node:test";
import assert from "node:assert/strict";
import { communityMapping, defaultCommunityPublication } from "../../lib/items/community-integration";

test("safe and recovered items are private by default", () => {
  assert.equal(defaultCommunityPublication("SAFE"), false);
  assert.equal(defaultCommunityPublication("RECOVERED"), false);
  assert.equal(communityMapping("SAFE", "Wallet"), null);
});

test("lost, found, and missing statuses publish by default", () => {
  assert.equal(defaultCommunityPublication("LOST"), true);
  assert.equal(defaultCommunityPublication("FOUND"), true);
  assert.equal(defaultCommunityPublication("MISSING"), true);
});

test("missing pet and document mappings are centralized", () => {
  assert.equal(communityMapping("MISSING", "Pet")?.postType, "MISSING_PET");
  assert.equal(communityMapping("LOST", "Documents")?.postType, "LOST_DOCUMENT");
  assert.equal(communityMapping("FOUND", "Documents")?.postType, "FOUND_DOCUMENT");
});

test("mapping output contains no owner contact or private QR fields", () => {
  const mapping = communityMapping("LOST", "Wallet");
  assert.deepEqual(Object.keys(mapping ?? {}).sort(), ["category", "postType"]);
});
