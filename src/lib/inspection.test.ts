import assert from "node:assert/strict";
import test from "node:test";
import { inspectionSample, inspectionSampleSize } from "./inspection";

test("sample size scales with the nursery and stays within 4 and 12", () => {
  assert.equal(inspectionSampleSize(0), 0);
  assert.equal(inspectionSampleSize(3), 3);
  assert.equal(inspectionSampleSize(10), 4);
  assert.equal(inspectionSampleSize(40), 8);
  assert.equal(inspectionSampleSize(200), 12);
});

test("the same day returns the same plants", () => {
  const cells = Array.from({ length: 20 }, (_, index) => ({ id: `cell-${index}` }));
  const first = inspectionSample(cells, "2026-10-13").map((cell) => cell.id);
  const second = inspectionSample(cells, "2026-10-13").map((cell) => cell.id);
  assert.deepEqual(first, second);
  assert.equal(new Set(first).size, first.length);
  assert.equal(first.length, inspectionSampleSize(cells.length));
});
