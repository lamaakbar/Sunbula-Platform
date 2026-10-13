"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { HealthStatus } from "@prisma/client";
import { requireRole, requireUser } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { alertOpenKey } from "@/lib/integrity-keys";
import { prisma } from "@/lib/prisma";
import { recordEvent } from "@/services/events";

const statuses = ["HEALTHY", "ATTENTION", "CRITICAL"] as const;
const symptoms = ["WILT", "SPOTS", "COLOR", "PEST", "OTHER"] as const;
const extents = ["CELL", "NEARBY", "ZONE"] as const;

const symptomText: Record<(typeof symptoms)[number], string> = {
  WILT: "Wilting",
  SPOTS: "Spots",
  COLOR: "Unusual color",
  PEST: "Insects or pests",
  OTHER: "Something else",
};

export async function recordInspectionAction(formData: FormData) {
  const user = await requireRole("EMPLOYEE");
  const cellId = String(formData.get("cellId") ?? "");
  const status = String(formData.get("status") ?? "");
  const symptom = String(formData.get("symptom") ?? "");
  const extent = String(formData.get("extent") ?? "CELL");
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500);
  const returnTo = safeReturn(String(formData.get("returnTo") ?? ""));

  if (!statuses.includes(status as (typeof statuses)[number])) {
    redirect(`${returnTo}?saved=inspection`);
  }
  if (!extents.includes(extent as (typeof extents)[number])) {
    redirect(`${returnTo}?saved=inspection`);
  }

  const cell = await getAccessibleCell(user, cellId);
  const batch = await prisma.seedlingBatch.findFirst({
    where: { plantCellId: cell.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const health = status as HealthStatus;
  const symptomLabel = symptoms.includes(symptom as (typeof symptoms)[number])
    ? symptomText[symptom as (typeof symptoms)[number]]
    : "";
  const raised = health !== "HEALTHY" && (extent === "NEARBY" || extent === "ZONE");
  const message = [
    symptomLabel,
    extent === "CELL" ? "Seen in this cell." : extent === "NEARBY" ? "Nearby cells look similar." : "A wider part of the zone looks similar.",
    notes,
    raised
      ? "Similar signs nearby raise suspicion and call for another look. They do not confirm spread or a disease."
      : "This record is a field check, not a diagnosis. A specialist decides the next step.",
  ]
    .filter(Boolean)
    .join(" ");

  await prisma.$transaction(async (tx) => {
    const assessment = await tx.healthAssessment.create({
      data: {
        plantCellId: cell.id,
        batchId: batch?.id,
        status: health,
        notes: message,
        assessedById: user.id,
      },
    });
    const operation = await tx.dailyOperation.create({
      data: {
        type: "INSPECTION",
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
        userId: user.id,
        occurredAt: new Date(),
        notes: message,
      },
    });
    await recordEvent(tx, {
      eventType: "OPERATION_RECORDED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      relatedEntityType: "HealthAssessment",
      relatedEntityId: assessment.id,
      details: { type: "INSPECTION", operationId: operation.id, status: health, extent },
    });

    if (batch && health !== "HEALTHY") {
      await tx.seedlingBatch.update({
        where: { id: batch.id },
        data: { healthStatus: health },
      });
    }

    if (health === "HEALTHY") {
      const open = await tx.alert.count({
        where: { plantCellId: cell.id, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      });
      if (batch && open === 0) {
        await tx.seedlingBatch.update({
          where: { id: batch.id },
          data: { healthStatus: "HEALTHY" },
        });
      }
      return;
    }

    const openKey = alertOpenKey(cell.id, "HEALTH_RISK");
    const existing = await tx.alert.findUnique({ where: { openKey } });
    if (existing) return;

    const alert = await tx.alert.create({
      data: {
        type: "HEALTH_RISK",
        severity: health === "CRITICAL" || raised ? "HIGH" : "MEDIUM",
        title: "Plant check needs review",
        message,
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
        openKey,
      },
    });
    await recordEvent(tx, {
      eventType: "ALERT_CREATED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      relatedEntityType: "Alert",
      relatedEntityId: alert.id,
      details: { type: "HEALTH_RISK", extent, suspicionOnly: raised },
    });
    const recommendation = await tx.recommendation.create({
      data: {
        alertId: alert.id,
        title: "Review this plant check",
        message:
          "Inspect this cell. If nearby cells were noted, look at them too. Similar signs do not confirm that a problem has spread.",
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
      },
    });
    await recordEvent(tx, {
      eventType: "RECOMMENDATION_GENERATED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      relatedEntityType: "Recommendation",
      relatedEntityId: recommendation.id,
      details: { source: "plant-check" },
    });
  });

  revalidatePath("/employee");
  revalidatePath("/employee/zone");
  revalidatePath("/employee/inspect");
  revalidatePath(`/employee/zone/${cell.id}`);
  revalidatePath("/employee/alerts");
  revalidatePath("/supervisor");
  revalidatePath("/hq");
  redirect(`${returnTo}?saved=inspection`);
}

export async function openPlantCodeAction(formData: FormData) {
  const user = await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  const base =
    user.role === "HQ" ? "/hq/plant" : user.role === "SUPERVISOR" ? "/supervisor/plant" : "/employee/plant";
  redirect(`${base}/${encodeURIComponent(code)}`);
}

function safeReturn(value: string) {
  if (value.startsWith("/employee/zone/") || value === "/employee/inspect") return value;
  return "/employee/inspect";
}
