import assert from "node:assert/strict";
import test from "node:test";
import { readingMeaning, validateReading } from "./index";

const now = new Date("2026-10-08T12:00:00.000Z");

function reading(overrides: Partial<Parameters<typeof validateReading>[0]> = {}) {
  return {
    metric: "SOIL_MOISTURE" as const,
    value: 42,
    unit: "%",
    source: "SENSOR" as const,
    timestamp: now,
    ...overrides,
  };
}

test("impossible, future, stale, duplicate, and out-of-order readings are classified separately", () => {
  assert.equal(validateReading(reading({ value: Number.NaN }), { now }).qualityStatus, "INVALID");
  assert.equal(validateReading(reading({ value: 140 }), { now }).qualityStatus, "INVALID");
  assert.equal(
    validateReading(reading({ timestamp: new Date(now.getTime() + 10 * 60 * 1000) }), { now }).qualityStatus,
    "INVALID",
  );
  assert.equal(
    validateReading(reading({ timestamp: new Date(now.getTime() - 49 * 60 * 60 * 1000) }), { now }).qualityStatus,
    "STALE",
  );
  assert.equal(
    validateReading(reading({ timestamp: new Date(now.getTime() - 10_000) }), {
      now,
      lastTimestamp: now,
    }).qualityStatus,
    "WARNING",
  );
  assert.equal(
    validateReading(reading({ timestamp: new Date(now.getTime() - 5 * 60 * 1000) }), {
      now,
      lastTimestamp: now,
    }).qualityStatus,
    "WARNING",
  );
  assert.equal(validateReading(reading({ source: "MANUAL" }), { now }).qualityStatus, "VALID");
});

test("a valid low moisture reading is agronomically low without becoming invalid", () => {
  const quality = validateReading(reading({ value: 18, source: "MANUAL" }), { now });
  assert.equal(quality.qualityStatus, "VALID");
  assert.equal(readingMeaning(18, { min: 40, max: 70 }), "LOW");
  assert.equal(readingMeaning(55, { min: 40, max: 70 }), "NORMAL");
  assert.equal(readingMeaning(55, null), "UNKNOWN");
});
