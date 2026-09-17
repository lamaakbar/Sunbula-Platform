import type { MetricType, QualityStatus, ReadingSource } from "@prisma/client";
import { STALE_READING_HOURS } from "@/lib/constants";

export type IncomingReading = {
  metric: MetricType;
  value: number;
  unit: string;
  source: ReadingSource;
  timestamp: Date;
  sensorId?: string | null;
};

export type KnowledgeRange = {
  min: number;
  max: number;
} | null;

const IMPOSSIBLE: Record<MetricType, { min: number; max: number }> = {
  SOIL_MOISTURE: { min: 0, max: 100 },
  TEMPERATURE: { min: -10, max: 60 },
  HUMIDITY: { min: 0, max: 100 },
  PH: { min: 0, max: 14 },
  WATER_LEVEL: { min: 0, max: 100 },
};

export function validateReading(
  reading: IncomingReading,
  options?: { lastTimestamp?: Date | null; now?: Date },
): { qualityStatus: QualityStatus; reasons: string[] } {
  const reasons: string[] = [];
  const now = options?.now ?? new Date();

  if (!Number.isFinite(reading.value)) {
    return { qualityStatus: "INVALID", reasons: ["Value is missing or not numeric."] };
  }

  const hard = IMPOSSIBLE[reading.metric];
  if (reading.value < hard.min || reading.value > hard.max) {
    return {
      qualityStatus: "INVALID",
      reasons: [`Value ${reading.value} is outside the possible range ${hard.min}–${hard.max}.`],
    };
  }

  if (reading.timestamp.getTime() > now.getTime() + 5 * 60 * 1000) {
    return { qualityStatus: "INVALID", reasons: ["Timestamp is in the future."] };
  }

  const ageHours = (now.getTime() - reading.timestamp.getTime()) / 3_600_000;
  if (ageHours > STALE_READING_HOURS) {
    reasons.push("Reading is older than 48 hours.");
    return { qualityStatus: "STALE", reasons };
  }

  if (options?.lastTimestamp) {
    const delta = Math.abs(reading.timestamp.getTime() - options.lastTimestamp.getTime());
    if (delta < 30_000 && reading.source === "SENSOR") {
      reasons.push("Possible duplicate sensor reading.");
      return { qualityStatus: "WARNING", reasons };
    }
  }

  return { qualityStatus: "VALID", reasons };
}

export function readingMeaning(
  value: number,
  range: KnowledgeRange,
): "LOW" | "HIGH" | "NORMAL" | "UNKNOWN" {
  if (!range) return "UNKNOWN";
  if (value < range.min) return "LOW";
  if (value > range.max) return "HIGH";
  return "NORMAL";
}
