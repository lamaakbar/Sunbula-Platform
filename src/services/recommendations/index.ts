import type { MetricType } from "@prisma/client";

export type KnowledgeContext = {
  speciesName: string;
  growthStage: string;
  moisture: { min: number; max: number };
  ph: { min: number; max: number };
  temperature: { min: number; max: number };
  irrigationGuidance: string;
  fertilizationGuidance: string;
  careGuidelines: string;
};

export function rangeForMetric(knowledge: KnowledgeContext | null, metric: MetricType) {
  if (!knowledge) return null;
  if (metric === "SOIL_MOISTURE") return knowledge.moisture;
  if (metric === "PH") return knowledge.ph;
  if (metric === "TEMPERATURE") return knowledge.temperature;
  return null;
}

export function recommendationFor(
  metric: MetricType,
  meaning: "LOW" | "HIGH" | "NORMAL" | "UNKNOWN",
  knowledge: KnowledgeContext | null,
) {
  if (meaning === "NORMAL") {
    return {
      title: "Conditions are within expected range",
      message: "No operational change is required from this reading.",
    };
  }

  if (metric === "SOIL_MOISTURE" && meaning === "LOW") {
    return {
      title: "Review irrigation",
      message:
        knowledge?.irrigationGuidance ??
        "Soil moisture is below the expected range. Review irrigation for this cell.",
    };
  }

  if (metric === "SOIL_MOISTURE" && meaning === "HIGH") {
    return {
      title: "Reduce watering if needed",
      message: "Soil moisture is above the expected range. Hold irrigation and re-check drainage.",
    };
  }

  if (metric === "PH") {
    return {
      title: "Review soil pH",
      message: knowledge?.careGuidelines ?? "pH is outside the expected range. Recheck and note conditions.",
    };
  }

  return {
    title: "Review this reading",
    message: "The value is outside the expected range for this species and growth stage.",
  };
}
