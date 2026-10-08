import assert from "node:assert/strict";
import test from "node:test";
import { recommendationFor } from "../recommendations";
import { alertEffect } from "./decision";

test("only a valid cell reading opens or resolves an alert", () => {
  assert.equal(alertEffect({ quality: "VALID", meaning: "LOW", hasCell: true }), "open_or_update");
  assert.equal(alertEffect({ quality: "VALID", meaning: "NORMAL", hasCell: true }), "resolve");
  assert.equal(alertEffect({ quality: "STALE", meaning: "NORMAL", hasCell: true }), "ignore");
  assert.equal(alertEffect({ quality: "WARNING", meaning: "LOW", hasCell: true }), "ignore");
  assert.equal(alertEffect({ quality: "VALID", meaning: "LOW", hasCell: false }), "ignore");
  assert.equal(alertEffect({ quality: "VALID", meaning: "UNKNOWN", hasCell: true }), "ignore");
});

test("low moisture recommends irrigation review and does not claim the soil changed", () => {
  const recommendation = recommendationFor("SOIL_MOISTURE", "LOW", null);
  assert.match(recommendation.message, /irrigation/i);
  assert.doesNotMatch(recommendation.message, /moisture is now/i);
});
