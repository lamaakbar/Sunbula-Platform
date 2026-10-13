const healthRank = {
  HEALTHY: 0,
  NO_RECENT_DATA: 1,
  ATTENTION: 2,
  CRITICAL: 3,
} as const;

export function raisedHealth(current: string, next: string) {
  const currentRank = healthRank[current as keyof typeof healthRank] ?? 0;
  const nextRank = healthRank[next as keyof typeof healthRank] ?? 0;
  return nextRank >= currentRank ? next : current;
}

export function inspectionReturnTo(value: string) {
  if (value === "/employee/inspect") return value;
  if (/^\/employee\/zone\/[A-Za-z0-9-]+$/.test(value)) return value;
  return "/employee/inspect";
}

export function isPlantCode(value: string) {
  return /^[A-Za-z0-9-]{1,80}$/.test(value);
}

export function inspectionSampleSize(cellCount: number) {
  if (cellCount <= 0) return 0;
  return Math.min(12, Math.max(4, Math.ceil(cellCount * 0.2)), cellCount);
}

export function inspectionSample<T extends { id: string }>(cells: T[], day: string) {
  const size = inspectionSampleSize(cells.length);
  return [...cells]
    .sort((a, b) => hash(`${day}:${a.id}`) - hash(`${day}:${b.id}`) || a.id.localeCompare(b.id))
    .slice(0, size);
}

export function inspectionDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
