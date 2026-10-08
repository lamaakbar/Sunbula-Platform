import assert from "node:assert/strict";
import test from "node:test";
import { nextLastReadingAt, parseSensorPayload, shouldStoreMeasurement } from "./payload";

test("sensor payloads reject missing ids and non-numeric values", () => {
  assert.equal(parseSensorPayload(null).ok, false);
  assert.equal(parseSensorPayload({ value: 20 }).ok, false);
  assert.equal(parseSensorPayload({ sensorId: "s1", value: "20" }).ok, false);
  assert.equal(parseSensorPayload({ sensorId: "s1", value: 20, timestamp: "not-a-date" }).ok, false);
  const parsed = parseSensorPayload({ sensorId: " s1 ", value: 20 });
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.payload.sensorId, "s1");
});

test("duplicates and older readings do not replace the latest timestamp", () => {
  const latest = new Date("2026-10-08T12:00:00.000Z");
  const older = new Date("2026-10-08T11:00:00.000Z");
  assert.equal(shouldStoreMeasurement("WARNING", latest, latest), false);
  assert.equal(shouldStoreMeasurement("VALID", older, latest), false);
  assert.equal(shouldStoreMeasurement("VALID", latest, older), true);
  assert.equal(shouldStoreMeasurement("STALE", latest, older), true);
  assert.equal(shouldStoreMeasurement("INVALID", latest, null), false);
  assert.equal(nextLastReadingAt(latest, older, false)?.toISOString(), latest.toISOString());
  assert.equal(nextLastReadingAt(latest, older, true)?.toISOString(), latest.toISOString());
  assert.equal(nextLastReadingAt(older, latest, true)?.toISOString(), latest.toISOString());
});
