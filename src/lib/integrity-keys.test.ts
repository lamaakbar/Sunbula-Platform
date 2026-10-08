import assert from "node:assert/strict";
import test from "node:test";
import { batchOpenSlot, batchSnapshotMatches, alertOpenKey, taskOpenKey } from "./integrity-keys";

test("an open batch update holds one slot and a closed review releases it", () => {
  assert.equal(batchOpenSlot("PENDING", "batch-1"), "batch:batch-1");
  assert.equal(batchOpenSlot("NEEDS_REVISION", "batch-1"), "batch:batch-1");
  assert.equal(batchOpenSlot("APPROVED", "batch-1"), null);
  assert.equal(batchOpenSlot("REJECTED", "batch-1"), null);
});

test("approval matches only the batch snapshot captured at submission", () => {
  assert.equal(
    batchSnapshotMatches({ quantity: 48, growthStage: "GROWING" }, { previousQuantity: 48, previousStage: "GROWING" }),
    true,
  );
  assert.equal(
    batchSnapshotMatches({ quantity: 55, growthStage: "GROWING" }, { previousQuantity: 48, previousStage: "GROWING" }),
    false,
  );
});

test("open alerts and tasks use a cell and type key", () => {
  assert.equal(alertOpenKey("cell-a", "LOW_MOISTURE"), "alert:cell-a:LOW_MOISTURE");
  assert.equal(taskOpenKey("cell-a", "WATERING"), "task:cell-a:WATERING");
});
