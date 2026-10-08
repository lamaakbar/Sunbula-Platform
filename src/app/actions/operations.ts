"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OperationType, TaskType } from "@prisma/client";
import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { operationSchema } from "@/lib/validations";
import { recordEvent } from "@/services/events";

const TASK_TYPE_FOR_OPERATION: Partial<Record<OperationType, TaskType>> = {
  IRRIGATION: "WATERING",
  FERTILIZATION: "FERTILIZING",
  REPLANTING: "REPLANTING",
  INSPECTION: "INSPECTION",
};

export type ActionState = { error?: string; ok?: string; values?: Record<string, string> };

export async function logOperationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const parsed = operationSchema.safeParse({
    cellId: formData.get("cellId"),
    type: formData.get("type"),
    amount: formData.get("amount") || undefined,
    unit: formData.get("unit") || undefined,
    notes: formData.get("notes") || undefined,
    taskId: formData.get("taskId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const cell = await getAccessibleCell(user, parsed.data.cellId);
  const batch = await prisma.seedlingBatch.findFirst({
    where: { plantCellId: cell.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const amountRaw = parsed.data.amount?.trim();
  const amount = amountRaw ? Number(amountRaw) : null;
  if (amountRaw && !Number.isFinite(amount)) {
    return { error: "Amount must be a number." };
  }

  const relatedTaskType = TASK_TYPE_FOR_OPERATION[parsed.data.type];

  await prisma.$transaction(async (tx) => {
    let taskId = parsed.data.taskId || null;
    if (taskId) {
      const task = await tx.task.findFirst({
        where: {
          id: taskId,
          assigneeId: user.id,
          nurseryId: cell.nurseryId,
          zoneId: cell.zoneId,
          plantCellId: cell.id,
          status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
          ...(relatedTaskType ? { type: relatedTaskType } : {}),
        },
      });
      if (!task) throw new Error("The selected task is not available for this operation.");
    }
    if (!taskId && relatedTaskType) {
      const related = await tx.task.findFirst({
        where: {
          plantCellId: cell.id,
          type: relatedTaskType,
          status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
          assigneeId: user.id,
        },
        orderBy: { dueAt: "asc" },
      });
      taskId = related?.id ?? null;
    }

    const operation = await tx.dailyOperation.create({
      data: {
        type: parsed.data.type,
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
        userId: user.id,
        taskId,
        occurredAt: new Date(),
        amount,
        unit: parsed.data.unit || null,
        notes: parsed.data.notes || null,
      },
    });

    await recordEvent(tx, {
      eventType: "OPERATION_RECORDED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      relatedEntityType: "DailyOperation",
      relatedEntityId: operation.id,
      details: {
        type: parsed.data.type,
        amount,
        unit: parsed.data.unit,
        cell: cell.code,
      },
    });

    if (parsed.data.type === "IRRIGATION") {
      await recordEvent(tx, {
        eventType: "IRRIGATION_PERFORMED",
        userId: user.id,
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
        relatedEntityType: "DailyOperation",
        relatedEntityId: operation.id,
        details: {
          cell: cell.code,
          amount,
          notes: parsed.data.notes,
          note: "Irrigation was logged. Soil moisture was not changed, and the alert stays open until a later reading is in range.",
        },
      });
    }

    if (taskId) {
      const completed = await tx.task.updateMany({
        where: {
          id: taskId,
          assigneeId: user.id,
          status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          openKey: null,
        },
      });
      if (completed.count !== 1) return;
      await recordEvent(tx, {
        eventType: "TASK_COMPLETED",
        userId: user.id,
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        batchId: batch?.id,
        relatedEntityType: "Task",
        relatedEntityId: taskId,
        details: { via: parsed.data.type },
      });
    }
  });

  revalidatePath("/employee");
  revalidatePath("/employee/alerts");
  revalidatePath("/employee/zone");
  revalidatePath(`/employee/zone/${cell.id}`);
  revalidatePath("/employee/tasks");
  revalidatePath("/employee/history");
  revalidatePath("/supervisor");
  revalidatePath("/hq");
  redirect(`/employee/zone/${cell.id}?saved=operation`);
}
