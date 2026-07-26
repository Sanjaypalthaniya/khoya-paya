import test from "node:test";
import assert from "node:assert/strict";
import { queryFor } from "../../components/community/CommunityFeed";

test("feed filters use the API contract and preserve cursor/search", () => {
  const query = queryFor("Documents", "cm12345678901234567890123", " black wallet ");
  assert.equal(query.get("category"), "DOCUMENTS");
  assert.equal(query.get("cursor"), "cm12345678901234567890123");
  assert.equal(query.get("search"), "black wallet");
  assert.equal(query.get("limit"), "6");
});

test("cleared feed search does not send a stale search parameter", () => {
  const query = queryFor("All", null, "");
  assert.equal(query.has("search"), false);
  assert.equal(query.has("cursor"), false);
});

test("feed recovery filters map to supported post types", () => {
  assert.equal(queryFor("Lost").get("type"), "LOST_ITEM");
  assert.equal(queryFor("Found").get("type"), "FOUND_ITEM");
  assert.equal(queryFor("Missing Pets").get("type"), "MISSING_PET");
});
