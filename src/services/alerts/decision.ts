import type { QualityStatus } from "@prisma/client";

export function alertEffect(input: {
  quality: QualityStatus;
  meaning: "LOW" | "HIGH" | "NORMAL" | "UNKNOWN";
  hasCell: boolean;
}): "ignore" | "resolve" | "open_or_update" {
  if (!input.hasCell || input.quality !== "VALID" || input.meaning === "UNKNOWN") return "ignore";
  if (input.meaning === "NORMAL") return "resolve";
  return "open_or_update";
}
