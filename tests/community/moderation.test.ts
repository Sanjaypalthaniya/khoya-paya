import test from "node:test";
import assert from "node:assert/strict";
import {
  moderateText,
  moderationHash,
  textSimilarity,
} from "../../lib/moderation/engine";

test("rejects explicit dangerous threats", () =>
  assert.equal(
    moderateText({ text: "I will shoot and kill you" }).decision,
    "REJECTED",
  ));
test("reviews scams and suspicious links", () =>
  assert.equal(
    moderateText({
      text: "Guaranteed reward pay fee first https://a.test https://b.test",
    }).decision,
    "UNDER_REVIEW",
  ));
test("reviews unrelated community posts", () =>
  assert.equal(
    moderateText({ text: "Today is a sunny day", requireRelevance: true })
      .reasonCode,
    "LOW_RELEVANCE",
  ));
test("approves relevant recovery content", () =>
  assert.equal(
    moderateText({
      text: "I found a wallet near the station",
      requireRelevance: true,
    }).decision,
    "APPROVED",
  ));
test("normalization gives stable duplicate hashes", () =>
  assert.equal(
    moderationHash("FOUND: Wallet!!!"),
    moderationHash("found wallet"),
  ));
test("near duplicate similarity catches reordered item reports", () =>
  assert.ok(
    textSimilarity(
      "Lost black wallet near central park gate",
      "Black wallet lost at the central park gate",
    ) >= 0.65,
  ));
