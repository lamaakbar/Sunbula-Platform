export type ScopeUser = {
  role: "EMPLOYEE" | "SUPERVISOR" | "HQ";
  nurseryId: string | null;
  assignedZoneIds: string[];
};

export function canAccessNursery(user: ScopeUser, nurseryId: string) {
  if (user.role === "HQ") return true;
  return Boolean(user.nurseryId) && user.nurseryId === nurseryId;
}

export function canAccessZone(user: ScopeUser, zoneId: string, zoneNurseryId: string) {
  if (!canAccessNursery(user, zoneNurseryId)) return false;
  if (user.role === "EMPLOYEE" && !user.assignedZoneIds.includes(zoneId)) return false;
  return true;
}
