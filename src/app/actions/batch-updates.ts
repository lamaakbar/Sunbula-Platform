"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { employeePrimaryZone } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { batchReviewSchema, batchUpdateSchema } from "@/lib/validations";
import { recordEvent } from "@/services/events";
import type { ActionState } from "@/app/actions/operations";

const OPEN_STATUSES = ["PENDING", "NEEDS_REVISION"] as const;

function valuesFrom(formData: FormData) {
  return {
    batchId: String(formData.get("batchId") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    growthStage: String(formData.get("growthStage") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    feedback: String(formData.get("feedback") ?? ""),
  };
}

function revalidateWorkflow() {
  revalidatePath("/employee");
  revalidatePath("/employee/updates");
  revalidatePath("/employee/history");
  revalidatePath("/supervisor");
  revalidatePath("/supervisor/updates");
  revalidatePath("/hq");
}

export async function submitBatchUpdateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const zone = employeePrimaryZone(user);
  if (!user.nurseryId || !zone) return { error: "No zone is assigned to this account.", values: valuesFrom(formData) };

  const parsed = batchUpdateSchema.safeParse({
    batchId: formData.get("batchId"),
    quantity: formData.get("quantity"),
    growthStage: formData.get("growthStage"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Complete the batch update.", values: valuesFrom(formData) };
  }

  const batch = await prisma.seedlingBatch.findFirst({
    where: { id: parsed.data.batchId, zoneId: zone.id, nurseryId: user.nurseryId, isActive: true },
  });
  if (!batch) return { error: "That batch is not in your assigned zone.", values: valuesFrom(formData) };

  const open = await prisma.batchUpdate.findFirst({
    where: { batchId: batch.id, status: { in: [...OPEN_STATUSES] } },
  });
  if (open) {
    return {
      error: "This batch already has an open update. Wait for review, or revise the existing one.",
      values: valuesFrom(formData),
    };
  }

  const created = await prisma.batchUpdate.create({
    data: {
      batchId: batch.id,
      nurseryId: batch.nurseryId,
      zoneId: batch.zoneId,
      submittedById: user.id,
      previousQuantity: batch.quantity,
      previousStage: batch.growthStage,
      proposedQuantity: parsed.data.quantity,
      proposedStage: parsed.data.growthStage,
      notes: parsed.data.notes,
    },
  });

  await recordEvent(prisma, {
    eventType: "BATCH_UPDATE_SUBMITTED",
    userId: user.id,
    nurseryId: batch.nurseryId,
    zoneId: batch.zoneId,
    plantCellId: batch.plantCellId,
    batchId: batch.id,
    relatedEntityType: "BatchUpdate",
    relatedEntityId: created.id,
    details: {
      fromQuantity: batch.quantity,
      toQuantity: parsed.data.quantity,
      fromStage: batch.growthStage,
      toStage: parsed.data.growthStage,
    },
  });

  revalidateWorkflow();
  redirect(`/employee/updates?tab=PENDING&id=${created.id}&saved=batch-submitted`);
}

export async function resubmitBatchUpdateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const zone = employeePrimaryZone(user);
  const updateId = String(formData.get("updateId") ?? "");
  if (!user.nurseryId || !zone) return { error: "No zone is assigned to this account.", values: valuesFrom(formData) };

  const parsed = batchUpdateSchema.safeParse({
    batchId: formData.get("batchId"),
    quantity: formData.get("quantity"),
    growthStage: formData.get("growthStage"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Complete the revision.", values: valuesFrom(formData) };
  }

  const existing = await prisma.batchUpdate.findFirst({
    where: {
      id: updateId,
      submittedById: user.id,
      zoneId: zone.id,
      status: "NEEDS_REVISION",
    },
    include: { batch: true },
  });
  if (!existing || existing.batchId !== parsed.data.batchId) {
    return { error: "This update can no longer be revised.", values: valuesFrom(formData) };
  }

  await prisma.batchUpdate.update({
    where: { id: existing.id },
    data: {
      previousQuantity: existing.batch.quantity,
      previousStage: existing.batch.growthStage,
      proposedQuantity: parsed.data.quantity,
      proposedStage: parsed.data.growthStage,
      notes: parsed.data.notes,
      status: "PENDING",
      feedback: existing.feedback,
      reviewedById: null,
      reviewedAt: null,
    },
  });

  await recordEvent(prisma, {
    eventType: "BATCH_UPDATE_RESUBMITTED",
    userId: user.id,
    nurseryId: existing.nurseryId,
    zoneId: existing.zoneId,
    batchId: existing.batchId,
    relatedEntityType: "BatchUpdate",
    relatedEntityId: existing.id,
    details: {
      toQuantity: parsed.data.quantity,
      toStage: parsed.data.growthStage,
      previousFeedback: existing.feedback,
    },
  });

  revalidateWorkflow();
  redirect(`/employee/updates?tab=PENDING&id=${existing.id}&saved=batch-resubmitted`);
}

export async function reviewBatchUpdateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("SUPERVISOR");
  if (!user.nurseryId) return { error: "No nursery is assigned to this account.", values: valuesFrom(formData) };

  const parsed = batchReviewSchema.safeParse({
    updateId: formData.get("updateId"),
    decision: formData.get("decision"),
    feedback: formData.get("feedback") || undefined,
  });
  if (!parsed.success) return { error: "Choose a valid decision.", values: valuesFrom(formData) };

  const feedback = parsed.data.feedback?.trim() ?? "";
  if ((parsed.data.decision === "reject" || parsed.data.decision === "revise") && feedback.length < 8) {
    return {
      error: "Write a reason the employee can act on.",
      values: valuesFrom(formData),
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.batchUpdate.findFirst({
        where: { id: parsed.data.updateId, nurseryId: user.nurseryId!, status: "PENDING" },
        include: { batch: true },
      });
      if (!current) {
        throw new Error("NOT_PENDING");
      }

      const reviewedAt = new Date();
      if (parsed.data.decision === "approve") {
        await tx.seedlingBatch.update({
          where: { id: current.batchId },
          data: {
            quantity: current.proposedQuantity,
            growthStage: current.proposedStage,
          },
        });
        await tx.batchUpdate.update({
          where: { id: current.id },
          data: {
            status: "APPROVED",
            feedback: feedback || null,
            reviewedById: user.id,
            reviewedAt,
          },
        });
        await recordEvent(tx, {
          eventType: "BATCH_UPDATE_APPROVED",
          userId: user.id,
          nurseryId: current.nurseryId,
          zoneId: current.zoneId,
          plantCellId: current.batch.plantCellId,
          batchId: current.batchId,
          relatedEntityType: "BatchUpdate",
          relatedEntityId: current.id,
          details: {
            fromQuantity: current.previousQuantity,
            toQuantity: current.proposedQuantity,
            fromStage: current.previousStage,
            toStage: current.proposedStage,
            note: "Batch updated. Assigned tasks were left unchanged.",
          },
        });
        return;
      }

      const status = parsed.data.decision === "reject" ? "REJECTED" : "NEEDS_REVISION";
      await tx.batchUpdate.update({
        where: { id: current.id },
        data: {
          status,
          feedback,
          reviewedById: user.id,
          reviewedAt,
        },
      });
      await recordEvent(tx, {
        eventType: status === "REJECTED" ? "BATCH_UPDATE_REJECTED" : "BATCH_UPDATE_REVISION_REQUESTED",
        userId: user.id,
        nurseryId: current.nurseryId,
        zoneId: current.zoneId,
        batchId: current.batchId,
        relatedEntityType: "BatchUpdate",
        relatedEntityId: current.id,
        details: { feedback },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_PENDING") {
      return { error: "This submission is no longer waiting for review.", values: valuesFrom(formData) };
    }
    throw error;
  }

  revalidateWorkflow();
  const tab = parsed.data.decision === "approve" ? "APPROVED" : parsed.data.decision === "reject" ? "REJECTED" : "NEEDS_REVISION";
  redirect(`/supervisor/updates?tab=${tab}&id=${parsed.data.updateId}&saved=batch-reviewed`);
}
