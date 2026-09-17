import type { HealthStatus, MetricType } from "@prisma/client";
import { STALE_READING_HOURS } from "@/lib/constants";
import { readingMeaning, type KnowledgeRange } from "@/services/data-quality";

export function isStale(timestamp: Date | null | undefined, now = new Date()) {
  if (!timestamp) return true;
  const ageHours = (now.getTime() - timestamp.getTime()) / 3_600_000;
  return ageHours > STALE_READING_HOURS;
}

export function deriveHealth(input: {
  lastReadingAt?: Date | null;
  moisture?: number | null;
  moistureRange?: KnowledgeRange;
  openCriticalAlerts?: number;
  stored?: HealthStatus | null;
  now?: Date;
}): HealthStatus {
  if (input.openCriticalAlerts && input.openCriticalAlerts > 0) return "CRITICAL";
  if (isStale(input.lastReadingAt, input.now) && !input.stored) return "NO_RECENT_DATA";
  if (isStale(input.lastReadingAt, input.now) && input.stored === "NO_RECENT_DATA") {
    return "NO_RECENT_DATA";
  }

  if (input.moisture != null) {
    const meaning = readingMeaning(input.moisture, input.moistureRange ?? null);
    if (meaning === "LOW" || meaning === "HIGH") return "ATTENTION";
  }

  if (input.stored === "CRITICAL") return "CRITICAL";
  if (input.stored === "ATTENTION") return "ATTENTION";
  if (input.stored === "NO_RECENT_DATA" || isStale(input.lastReadingAt, input.now)) {
    return "NO_RECENT_DATA";
  }
  return "HEALTHY";
}

export function healthTone(status: HealthStatus) {
  switch (status) {
    case "HEALTHY":
      return {
        text: "text-healthy",
        bg: "bg-healthy/10",
        border: "border-healthy/30",
        dot: "bg-healthy",
        icon: "healthy" as const,
      };
    case "ATTENTION":
      return {
        text: "text-attention",
        bg: "bg-attention/15",
        border: "border-attention/40",
        dot: "bg-attention",
        icon: "attention" as const,
      };
    case "CRITICAL":
      return {
        text: "text-critical",
        bg: "bg-critical/10",
        border: "border-critical/30",
        dot: "bg-critical",
        icon: "critical" as const,
      };
    default:
      return {
        text: "text-muted",
        bg: "bg-sand/80",
        border: "border-sand",
        dot: "bg-muted",
        icon: "unknown" as const,
      };
  }
}

export function nurseryStatusFromScore(score: number): HealthStatus {
  if (score >= 80) return "HEALTHY";
  if (score >= 65) return "ATTENTION";
  return "CRITICAL";
}

export const metricShort: Record<MetricType, string> = {
  SOIL_MOISTURE: "Moisture",
  TEMPERATURE: "Temp",
  HUMIDITY: "Humidity",
  PH: "pH",
  WATER_LEVEL: "Water",
};
