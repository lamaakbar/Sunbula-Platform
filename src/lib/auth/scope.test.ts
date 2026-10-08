import assert from "node:assert/strict";
import test from "node:test";
import { canAccessNursery, canAccessZone } from "./scope";

const employee = {
  role: "EMPLOYEE" as const,
  nurseryId: "eastern",
  assignedZoneIds: ["zone-a", "zone-b"],
};

test("an employee can open every assigned zone and no other nursery", () => {
  assert.equal(canAccessZone(employee, "zone-a", "eastern"), true);
  assert.equal(canAccessZone(employee, "zone-b", "eastern"), true);
  assert.equal(canAccessZone(employee, "zone-c", "eastern"), false);
  assert.equal(canAccessZone(employee, "zone-a", "riyadh"), false);
});

test("a supervisor stays inside one nursery and HQ can cross nurseries", () => {
  const supervisor = { role: "SUPERVISOR" as const, nurseryId: "eastern", assignedZoneIds: [] };
  assert.equal(canAccessNursery(supervisor, "eastern"), true);
  assert.equal(canAccessNursery(supervisor, "riyadh"), false);
  assert.equal(canAccessZone(supervisor, "zone-c", "eastern"), true);
  assert.equal(canAccessNursery({ role: "HQ", nurseryId: null, assignedZoneIds: [] }, "riyadh"), true);
});
