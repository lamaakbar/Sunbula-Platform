"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MetricType } from "@prisma/client";
import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { getKnowledge } from "@/lib/domain/knowledge";
import { prisma } from "@/lib/prisma";
import { readingSchema } from "@/lib/validations";
import { evaluateReading } from "@/services/alerts/engine";
import { validateReading } from "@/services/data-quality";
import { recordEvent } from "@/services/events";
import { metricUnit } from "@/lib/format";
import type { ActionState } from "@/app/actions/operations";

export async function addManualReadingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const parsed = readingSchema.safeParse({
    cellId: formData.get("cellId"),
    metric: formData.get("metric"),
    value: formData.get("value"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the reading." };
  }

  const cell = await getAccessibleCell(user, parsed.data.cellId);
  const batch = await prisma.seedlingBatch.findFirst({
    where: { plantCellId: cell.id, isActive: true },
    include: { species: true },
    orderBy: { createdAt: "desc" },
  });

  const metric = parsed.data.metric as MetricType;
  const last = await prisma.plantMeasurement.findFirst({
    where: { plantCellId: cell.id, metric },
    orderBy: { timestamp: "desc" },
  });

  const timestamp = new Date();
  const quality = validateReading(
    {
      metric,
      value: parsed.data.value,
      unit: metricUnit[metric],
      source: "MANUAL",
      timestamp,
    },
    { lastTimestamp: last?.timestamp, now: timestamp },
  );

  if (quality.qualityStatus === "INVALID") {
    return { error: quality.reasons[0] ?? "This reading could not be saved." };
  }

  const knowledge = batch ? await getKnowledge(batch.speciesId, batch.growthStage) : null;
  const assignee = await prisma.employeeZoneAssignment.findFirst({
    where: { zoneId: cell.zoneId },
  });

  await prisma.$transaction(async (tx) => {
    const measurement = await tx.plantMeasurement.create({
      data: {
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
        metric,
        value: parsed.data.value,
        unit: metricUnit[metric],
        source: "MANUAL",
        qualityStatus: quality.qualityStatus,
        recordedById: user.id,
        timestamp,
        notes: parsed.data.notes || null,
      },
    });

    await recordEvent(tx, {
      eventType: "READING_RECORDED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      relatedEntityType: "PlantMeasurement",
      relatedEntityId: measurement.id,
      details: {
        metric,
        value: parsed.data.value,
        source: "MANUAL",
        quality: quality.qualityStatus,
        recordedBy: user.fullName,
      },
    });

    await evaluateReading(tx, {
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      metric,
      value: parsed.data.value,
      knowledge,
      assigneeId: assignee?.userId ?? user.id,
      userId: user.id,
    });
  });

  revalidatePath("/employee");
  revalidatePath("/employee/zone");
  revalidatePath(`/employee/zone/${cell.id}`);
  revalidatePath("/employee/monitoring");
  revalidatePath("/supervisor");
  revalidatePath("/hq");
  redirect(`/employee/zone/${cell.id}?saved=reading`);
}
