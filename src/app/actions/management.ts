"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { inventoryUpdateSchema, requestSchema, reviewRequestSchema, productionTargetSchema } from "@/lib/validations";
import { recordEvent } from "@/services/events";
import type { ActionState } from "@/app/actions/operations";

export async function updateInventoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  if (!user.nurseryId) return { error: "No nursery assigned." };

  const parsed = inventoryUpdateSchema.safeParse({
    inventoryId: formData.get("inventoryId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { error: "Enter a valid quantity." };

  const item = await prisma.inventoryItem.findFirst({
    where: {
      id: parsed.data.inventoryId,
      nurseryId: user.nurseryId,
      state: { in: ["READY", "IN_PRODUCTION"] },
    },
  });
  if (!item) return { error: "You can only update ready or in-progress stock." };

  await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id: item.id },
      data: { quantity: parsed.data.quantity },
    });
    await tx.inventoryTransaction.create({
      data: {
        inventoryId: item.id,
        quantityChange: parsed.data.quantity - item.quantity,
        previousQuantity: item.quantity,
        newQuantity: parsed.data.quantity,
        reason: "Employee stock update",
        userId: user.id,
      },
    });
    await recordEvent(tx, {
      eventType: "INVENTORY_UPDATED",
      userId: user.id,
      nurseryId: user.nurseryId,
      relatedEntityType: "InventoryItem",
      relatedEntityId: item.id,
      details: { from: item.quantity, to: parsed.data.quantity, state: item.state },
    });
  });

  revalidatePath("/employee/inventory");
  revalidatePath("/supervisor");
  revalidatePath("/hq");
  redirect("/employee/inventory?saved=inventory");
}

export async function submitRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("SUPERVISOR");
  if (!user.nurseryId) return { error: "No nursery assigned." };

  const parsed = requestSchema.safeParse({
    speciesId: formData.get("speciesId"),
    quantity: formData.get("quantity"),
    requiredDate: formData.get("requiredDate"),
    reason: formData.get("reason"),
    purpose: formData.get("purpose") || undefined,
    priority: formData.get("priority"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the request." };
  }

  const ready = await prisma.inventoryItem.findFirst({
    where: { nurseryId: user.nurseryId, speciesId: parsed.data.speciesId, state: "READY" },
  });

  await prisma.$transaction(async (tx) => {
    const request = await tx.seedlingRequest.create({
      data: {
        nurseryId: user.nurseryId!,
        speciesId: parsed.data.speciesId,
        quantity: parsed.data.quantity,
        requiredDate: new Date(parsed.data.requiredDate),
        currentStock: ready?.quantity ?? 0,
        reason: parsed.data.reason,
        purpose: parsed.data.purpose || null,
        priority: parsed.data.priority,
        notes: parsed.data.notes || null,
        submittedById: user.id,
      },
    });

    await recordEvent(tx, {
    eventType: "REQUEST_SUBMITTED",
    userId: user.id,
    nurseryId: user.nurseryId,
    relatedEntityType: "SeedlingRequest",
    relatedEntityId: request.id,
    details: { quantity: parsed.data.quantity, speciesId: parsed.data.speciesId },
    });
  });

  revalidatePath("/supervisor/requests");
  revalidatePath("/hq/requests");
  redirect("/supervisor/requests?saved=request");
}

export async function reviewRequestAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("HQ");
  const parsed = reviewRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    reviewNotes: formData.get("reviewNotes") || undefined,
  });
  if (!parsed.success) return { error: "Unable to update this request." };

  const existing = await prisma.seedlingRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!existing) return { error: "This request was not found." };
  if (existing.status === "COMPLETED") return { error: "This request is already completed." };

  const eventType =
    parsed.data.status === "APPROVED"
      ? "REQUEST_APPROVED"
      : parsed.data.status === "REJECTED"
        ? "REQUEST_REJECTED"
        : "REQUEST_UNDER_REVIEW";

  const claimed = await prisma.$transaction(async (tx) => {
    const updated = await tx.seedlingRequest.updateMany({
      where: { id: existing.id, status: existing.status },
      data: {
        status: parsed.data.status,
        reviewNotes: parsed.data.reviewNotes || null,
        reviewedById: user.id,
      },
    });
    if (updated.count !== 1) return false;
    await recordEvent(tx, {
      eventType,
      userId: user.id,
      nurseryId: existing.nurseryId,
      relatedEntityType: "SeedlingRequest",
      relatedEntityId: existing.id,
      details: { status: parsed.data.status, notes: parsed.data.reviewNotes },
    });
    return true;
  });
  if (!claimed) return { error: "This request changed before the decision was saved." };

  revalidatePath("/hq/requests");
  revalidatePath("/supervisor/requests");
  redirect(`/hq/requests?saved=review&id=${existing.id}`);
}

export async function createProductionTargetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("HQ");
  const parsed = productionTargetSchema.safeParse({
    nurseryId: formData.get("nurseryId"),
    zoneId: formData.get("zoneId") || undefined,
    speciesId: formData.get("speciesId"),
    targetQuantity: formData.get("targetQuantity"),
    targetDate: formData.get("targetDate"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the target." };
  }

  const nursery = await prisma.nursery.findUnique({ where: { id: parsed.data.nurseryId } });
  if (!nursery) return { error: "Nursery was not found." };
  if (parsed.data.zoneId) {
    const zone = await prisma.zone.findFirst({
      where: { id: parsed.data.zoneId, nurseryId: nursery.id },
    });
    if (!zone) return { error: "That zone is not in the selected nursery." };
  }
  const species = await prisma.species.findUnique({ where: { id: parsed.data.speciesId } });
  if (!species) return { error: "Species was not found." };

  await prisma.productionTarget.create({
    data: {
      nurseryId: parsed.data.nurseryId,
      zoneId: parsed.data.zoneId || null,
      speciesId: parsed.data.speciesId,
      targetQuantity: parsed.data.targetQuantity,
      targetDate: new Date(parsed.data.targetDate),
      createdById: user.id,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/hq/production");
  redirect("/hq/production?saved=target");
}
