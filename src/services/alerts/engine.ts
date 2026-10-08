import type { Prisma, AlertType, MetricType, TaskType } from "@prisma/client";
import { readingMeaning } from "@/services/data-quality";
import { rangeForMetric, recommendationFor, type KnowledgeContext } from "@/services/recommendations";
import { recordEvent } from "@/services/events";

type Db = Prisma.TransactionClient;

type EvaluateInput = {
  nurseryId: string;
  zoneId: string;
  plantCellId?: string | null;
  batchId?: string | null;
  metric: MetricType;
  value: number;
  knowledge: KnowledgeContext | null;
  assigneeId?: string | null;
  userId?: string | null;
};

function taskTypeFor(metric: MetricType, meaning: "LOW" | "HIGH"): TaskType {
  if (metric === "SOIL_MOISTURE" && meaning === "LOW") return "WATERING";
  return "INSPECTION";
}

function alertTypeFor(metric: MetricType, meaning: "LOW" | "HIGH"): AlertType {
  if (metric === "SOIL_MOISTURE" && meaning === "LOW") return "LOW_MOISTURE";
  if (metric === "SOIL_MOISTURE" && meaning === "HIGH") return "HIGH_MOISTURE";
  if (metric === "PH") return "PH_OUT_OF_RANGE";
  if (metric === "TEMPERATURE") return "TEMPERATURE_STRESS";
  return "HEALTH_RISK";
}

export async function evaluateReading(db: Db, input: EvaluateInput) {
  const range = rangeForMetric(input.knowledge, input.metric);
  const meaning = readingMeaning(input.value, range);

  if (!input.plantCellId || meaning === "UNKNOWN") {
    return { meaning, alertId: null as string | null };
  }

  if (meaning === "NORMAL") {
    const open = await db.alert.findMany({
      where: {
        plantCellId: input.plantCellId,
        triggerMetric: input.metric,
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
    });

    for (const alert of open) {
      await db.alert.update({
        where: { id: alert.id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
      await recordEvent(db, {
        eventType: "ALERT_RESOLVED",
        userId: input.userId,
        nurseryId: input.nurseryId,
        zoneId: input.zoneId,
        plantCellId: input.plantCellId,
        batchId: input.batchId,
        relatedEntityType: "Alert",
        relatedEntityId: alert.id,
        details: {
          reason: "Reading returned to expected range",
          metric: input.metric,
          value: input.value,
        },
      });
    }

    if (input.batchId) {
      const unresolved = await db.alert.count({
        where: { batchId: input.batchId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      });
      await db.seedlingBatch.update({
        where: { id: input.batchId },
        data: { healthStatus: unresolved > 0 ? "ATTENTION" : "HEALTHY" },
      });
    }
    return { meaning, alertId: null as string | null };
  }

  const type = alertTypeFor(input.metric, meaning);
  const existing = await db.alert.findFirst({
    where: {
      plantCellId: input.plantCellId,
      type,
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
  });

  const rec = recommendationFor(input.metric, meaning, input.knowledge);
  const title =
    input.metric === "SOIL_MOISTURE" && meaning === "LOW"
      ? "Low moisture"
      : `${input.metric.replaceAll("_", " ").toLowerCase()} needs review`;

  let alertId = existing?.id ?? null;

  if (!existing) {
    const alert = await db.alert.create({
      data: {
        type,
        severity: meaning === "LOW" && input.metric === "SOIL_MOISTURE" ? "HIGH" : "MEDIUM",
        title,
        message: `${title}. Current reading ${input.value}. Expected ${range ? `${range.min}–${range.max}` : "range unavailable"}.`,
        nurseryId: input.nurseryId,
        zoneId: input.zoneId,
        plantCellId: input.plantCellId,
        batchId: input.batchId,
        triggerMetric: input.metric,
        triggerValue: input.value,
      },
    });
    alertId = alert.id;

    await recordEvent(db, {
      eventType: "ALERT_CREATED",
      userId: input.userId,
      nurseryId: input.nurseryId,
      zoneId: input.zoneId,
      plantCellId: input.plantCellId,
      batchId: input.batchId,
      relatedEntityType: "Alert",
      relatedEntityId: alert.id,
      details: { title, metric: input.metric, value: input.value, expected: range },
    });

    const recommendation = await db.recommendation.create({
      data: {
        alertId: alert.id,
        title: rec.title,
        message: rec.message,
        nurseryId: input.nurseryId,
        zoneId: input.zoneId,
        plantCellId: input.plantCellId,
        batchId: input.batchId,
      },
    });

    await recordEvent(db, {
      eventType: "RECOMMENDATION_GENERATED",
      userId: input.userId,
      nurseryId: input.nurseryId,
      zoneId: input.zoneId,
      plantCellId: input.plantCellId,
      batchId: input.batchId,
      relatedEntityType: "Recommendation",
      relatedEntityId: recommendation.id,
      details: { title: rec.title, trigger: title },
    });

    const openTask = await db.task.findFirst({
      where: {
        plantCellId: input.plantCellId,
        type: taskTypeFor(input.metric, meaning),
        status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      },
    });

    if (!openTask) {
      const due = new Date();
      due.setHours(due.getHours() + 3);
      const task = await db.task.create({
        data: {
          type: taskTypeFor(input.metric, meaning),
          title: rec.title,
          description: rec.message,
          status: "PENDING",
          priority: input.metric === "SOIL_MOISTURE" && meaning === "LOW" ? "URGENT" : "HIGH",
          dueAt: due,
          nurseryId: input.nurseryId,
          zoneId: input.zoneId,
          plantCellId: input.plantCellId,
          batchId: input.batchId,
          assigneeId: input.assigneeId,
          recommendationId: recommendation.id,
          alertId: alert.id,
        },
      });

      await recordEvent(db, {
        eventType: "TASK_ASSIGNED",
        userId: input.userId,
        nurseryId: input.nurseryId,
        zoneId: input.zoneId,
        plantCellId: input.plantCellId,
        batchId: input.batchId,
        relatedEntityType: "Task",
        relatedEntityId: task.id,
        details: { title: task.title, assigneeId: input.assigneeId },
      });
    }
  } else {
    await db.alert.update({
      where: { id: existing.id },
      data: { triggerValue: input.value },
    });
  }

  if (input.batchId) {
    await db.seedlingBatch.update({
      where: { id: input.batchId },
      data: { healthStatus: "ATTENTION" },
    });
  }
  return { meaning, alertId };
}
