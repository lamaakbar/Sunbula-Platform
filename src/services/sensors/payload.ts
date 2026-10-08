import type { QualityStatus } from "@prisma/client";

export type SensorPayload = {
  sensorId: string;
  value: number;
  timestamp?: Date;
};

export function parseSensorPayload(body: unknown, now = new Date()): { ok: true; payload: SensorPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Request body must be a JSON object." };
  const record = body as Record<string, unknown>;
  if (typeof record.sensorId !== "string" || record.sensorId.trim().length === 0) {
    return { ok: false, error: "sensorId is required." };
  }
  if (typeof record.value !== "number" || !Number.isFinite(record.value)) {
    return { ok: false, error: "value must be a finite number." };
  }

  let timestamp: Date | undefined;
  if (record.timestamp !== undefined) {
    if (typeof record.timestamp !== "string") return { ok: false, error: "timestamp must be an ISO date string." };
    timestamp = new Date(record.timestamp);
    if (Number.isNaN(timestamp.getTime())) return { ok: false, error: "timestamp is not a valid date." };
  }

  return {
    ok: true,
    payload: {
      sensorId: record.sensorId.trim(),
      value: record.value,
      timestamp: timestamp ?? now,
    },
  };
}

export function shouldStoreMeasurement(quality: QualityStatus, timestamp: Date, latestTimestamp: Date | null) {
  if (quality === "INVALID" || quality === "WARNING") return false;
  if (latestTimestamp && timestamp.getTime() < latestTimestamp.getTime()) return false;
  return quality === "VALID" || quality === "STALE";
}

export function nextLastReadingAt(current: Date | null, timestamp: Date, store: boolean) {
  if (!store) return current;
  if (!current || timestamp.getTime() >= current.getTime()) return timestamp;
  return current;
}
