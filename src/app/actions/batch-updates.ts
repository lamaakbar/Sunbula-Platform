"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { batchOpenSlot, batchSnapshotMatches, isUniqueConstraintError } from "@/lib/integrity-keys";
import { prisma } from "@/lib/prisma";
import { batchReviewSchema, batchUpdateSchema } from "@/lib/validations";
import { recordEvent } from "@/services/events";
import type { ActionState } from "@/app/actions/operations";

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
  const values = valuesFrom(formData);
  if (!user.nurseryId || user.assignedZoneIds.length === 0) {
    return { error: "No zone is assigned to this account.", values };
  }

  const parsed = batchUpdateSchema.safeParse({
    batchId: formData.get("batchId"),
    quantity: formData.get("quantity"),
    growthStage: formData.get("growthStage"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Complete the batch update.", values };
  }

  const batch = await prisma.seedlingBatch.findFirst({
    where: {
      id: parsed.data.batchId,
      zoneId: { in: user.assignedZoneIds },
      nurseryId: user.nurseryId,
      isActive: true,
    },
  });
  if (!batch) return { error: "That batch is not in your assigned zone.", values };

  let createdId = "";
  try {
    createdId = await prisma.$transaction(async (tx) => {
      const created = await tx.batchUpdate.create({
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
          status: "PENDING",
          openSlot: batchOpenSlot("PENDING", batch.id),
        },
      });

      await recordEvent(tx, {
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
      return created.id;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        error: "This batch already has an open update. Wait for review, or revise the existing one.",
        values,
      };
    }
    throw error;
  }

  revalidateWorkflow();
  redirect(`/employee/updates?tab=PENDING&id=${createdId}&saved=batch-submitted`);
}

export async function resubmitBatchUpdateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const values = valuesFrom(formData);
  const updateId = String(formData.get("updateId") ?? "");
  if (!user.nurseryId || user.assignedZoneIds.length === 0) {
    return { error: "No zone is assigned to this account.", values };
  }

  const parsed = batchUpdateSchema.safeParse({
    batchId: formData.get("batchId"),
    quantity: formData.get("quantity"),
    growthStage: formData.get("growthStage"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Complete the revision.", values };
  }

  try {
    const revised = await prisma.$transaction(async (tx) => {
      const existing = await tx.batchUpdate.findFirst({
        where: {
          id: updateId,
          submittedById: user.id,
          zoneId: { in: user.assignedZoneIds },
          status: "NEEDS_REVISION",
          batchId: parsed.data.batchId,
        },
        include: { batch: true },
      });
      if (!existing) return null;

      const claimed = await tx.batchUpdate.updateMany({
        where: { id: existing.id, status: "NEEDS_REVISION", submittedById: user.id },
        data: {
          previousQuantity: existing.batch.quantity,
          previousStage: existing.batch.growthStage,
          proposedQuantity: parsed.data.quantity,
          proposedStage: parsed.data.growthStage,
          notes: parsed.data.notes,
          status: "PENDING",
          openSlot: batchOpenSlot("PENDING", existing.batchId),
          feedback: existing.feedback,
          reviewedById: null,
          reviewedAt: null,
        },
      });
      if (claimed.count !== 1) return null;

      await recordEvent(tx, {
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
      return existing.id;
    });

    if (!revised) return { error: "This update can no longer be revised.", values };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "This batch already has an open update.", values };
    }
    throw error;
  }

  revalidateWorkflow();
  redirect(`/employee/updates?tab=PENDING&id=${updateId}&saved=batch-resubmitted`);
}

export async function reviewBatchUpdateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("SUPERVISOR");
  const values = valuesFrom(formData);
  if (!user.nurseryId) return { error: "No nursery is assigned to this account.", values };

  const parsed = batchReviewSchema.safeParse({
    updateId: formData.get("updateId"),
    decision: formData.get("decision"),
    feedback: formData.get("feedback") || undefined,
  });
  if (!parsed.success) return { error: "Choose a valid decision.", values };

  const feedback = parsed.data.feedback?.trim() ?? "";
  if ((parsed.data.decision === "reject" || parsed.data.decision === "revise") && feedback.length < 8) {
    return { error: "Write a reason the employee can act on.", values };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.batchUpdate.findFirst({
        where: { id: parsed.data.updateId, nurseryId: user.nurseryId!, status: "PENDING" },
        include: { batch: true },
      });
      if (!current) throw new Error("NOT_PENDING");

      if (parsed.data.decision === "approve" && !batchSnapshotMatches(current.batch, current)) {
        throw new Error("STALE");
      }

      const reviewedAt = new Date();
      const nextStatus = parsed.data.decision === "approve" ? "APPROVED" : parsed.data.decision === "reject" ? "REJECTED" : "NEEDS_REVISION";
      const claimed = await tx.batchUpdate.updateMany({
        where: { id: current.id, status: "PENDING", nurseryId: user.nurseryId! },
        data: {
          status: nextStatus,
          feedback: feedback || null,
          reviewedById: user.id,
          reviewedAt,
          openSlot: batchOpenSlot(nextStatus, current.batchId),
        },
      });
      if (claimed.count !== 1) throw new Error("NOT_PENDING");

      if (parsed.data.decision === "approve") {
        const written = await tx.seedlingBatch.updateMany({
          where: {
            id: current.batchId,
            quantity: current.previousQuantity,
            growthStage: current.previousStage,
            isActive: true,
          },
          data: {
            quantity: current.proposedQuantity,
            growthStage: current.proposedStage,
          },
        });
        if (written.count !== 1) throw new Error("STALE");

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

      await recordEvent(tx, {
        eventType: nextStatus === "REJECTED" ? "BATCH_UPDATE_REJECTED" : "BATCH_UPDATE_REVISION_REQUESTED",
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
      return { error: "This submission is no longer waiting for review.", values };
    }
    if (error instanceof Error && error.message === "STALE") {
      return {
        error: "The batch changed after this submission. It was not approved. Ask for a new update.",
        values,
      };
    }
    throw error;
  }

  revalidateWorkflow();
  const tab = parsed.data.decision === "approve" ? "APPROVED" : parsed.data.decision === "reject" ? "REJECTED" : "NEEDS_REVISION";
  redirect(`/supervisor/updates?tab=${tab}&id=${parsed.data.updateId}&saved=batch-reviewed`);
}
