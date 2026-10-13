import assert from "node:assert/strict";
import test from "node:test";
import { inspectionReturnTo, inspectionSample, inspectionSampleSize, isPlantCode, raisedHealth } from "./inspection";

test("sample size scales with the nursery and stays within 4 and 12", () => {
  assert.equal(inspectionSampleSize(0), 0);
  assert.equal(inspectionSampleSize(3), 3);
  assert.equal(inspectionSampleSize(10), 4);
  assert.equal(inspectionSampleSize(40), 8);
  assert.equal(inspectionSampleSize(200), 12);
});

test("a milder check does not clear a more serious status", () => {
  assert.equal(raisedHealth("CRITICAL", "ATTENTION"), "CRITICAL");
  assert.equal(raisedHealth("ATTENTION", "CRITICAL"), "CRITICAL");
  assert.equal(raisedHealth("HEALTHY", "ATTENTION"), "ATTENTION");
});

test("plant codes and return paths stay inside the app", () => {
  assert.equal(isPlantCode("B-zone-eastern-a-a-01"), true);
  assert.equal(isPlantCode(""), false);
  assert.equal(isPlantCode("../hq"), false);
  assert.equal(inspectionReturnTo("/employee/inspect"), "/employee/inspect");
  assert.equal(inspectionReturnTo("/employee/zone/cell-zone-eastern-a-a-01"), "/employee/zone/cell-zone-eastern-a-a-01");
  assert.equal(inspectionReturnTo("https://example.com"), "/employee/inspect");
  assert.equal(inspectionReturnTo("/employee/zone/../hq"), "/employee/inspect");
});

test("the same day returns the same plants", () => {
  const cells = Array.from({ length: 20 }, (_, index) => ({ id: `cell-${index}` }));
  const first = inspectionSample(cells, "2026-10-13").map((cell) => cell.id);
  const second = inspectionSample(cells, "2026-10-13").map((cell) => cell.id);
  assert.deepEqual(first, second);
  assert.equal(new Set(first).size, first.length);
  assert.equal(first.length, inspectionSampleSize(cells.length));
});
