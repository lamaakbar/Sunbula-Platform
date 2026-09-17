import type {
  GrowthStage,
  HealthStatus,
  MetricType,
  OperationType,
  QualityStatus,
  ReadingSource,
  RequestStatus,
  TaskStatus,
} from "@prisma/client";

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function relativeTime(value: Date | string, now = new Date()) {
  const date = new Date(value);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function plantAgeDays(plantingDate: Date | string, now = new Date()) {
  const start = new Date(plantingDate);
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function plantAgeLabel(plantingDate: Date | string) {
  const days = plantAgeDays(plantingDate);
  if (days < 14) return `${days} days`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} (${days} days)`;
}

export function numberFmt(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export const healthLabel: Record<HealthStatus, string> = {
  HEALTHY: "Healthy",
  ATTENTION: "Needs attention",
  CRITICAL: "Critical",
  NO_RECENT_DATA: "No recent data",
};

export const growthLabel: Record<GrowthStage, string> = {
  SEEDLING: "Seedling",
  GROWING: "Growing",
  READY: "Ready",
  DISTRIBUTED: "Distributed",
};

export const metricLabel: Record<MetricType, string> = {
  SOIL_MOISTURE: "Soil moisture",
  TEMPERATURE: "Temperature",
  HUMIDITY: "Humidity",
  PH: "pH",
  WATER_LEVEL: "Water level",
};

export const metricUnit: Record<MetricType, string> = {
  SOIL_MOISTURE: "%",
  TEMPERATURE: "°C",
  HUMIDITY: "%",
  PH: "pH",
  WATER_LEVEL: "%",
};

export const sourceLabel: Record<ReadingSource, string> = {
  SENSOR: "Sensor reading",
  MANUAL: "Manual reading",
  EXTERNAL: "External source",
};

export const qualityLabel: Record<QualityStatus, string> = {
  VALID: "Valid",
  WARNING: "Warning",
  INVALID: "Invalid",
  STALE: "Stale",
};

export const operationLabel: Record<OperationType, string> = {
  IRRIGATION: "Irrigation",
  FERTILIZATION: "Fertilization",
  REPLANTING: "Replanting",
  INSPECTION: "Inspection",
  OTHER: "Other",
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
};

export const requestStatusLabel: Record<RequestStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
