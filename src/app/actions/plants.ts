"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { addBatchSchema } from "@/lib/validations";
import { recordEvent } from "@/services/events";
import type { ActionState } from "@/app/actions/operations";

export async function addPlantBatchAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const parsed = addBatchSchema.safeParse({
    kind: formData.get("kind"),
    speciesId: formData.get("speciesId"),
    quantity: formData.get("quantity"),
    source: formData.get("source"),
    plantingDate: formData.get("plantingDate"),
    cellId: formData.get("cellId"),
    growthStage: formData.get("growthStage"),
    healthStatus: formData.get("healthStatus"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete each step." };
  }

  const cell = await getAccessibleCell(user, parsed.data.cellId);
  const species = await prisma.species.findUnique({ where: { id: parsed.data.speciesId } });
  if (!species) return { error: "Species was not found." };

  const prefix = parsed.data.kind === "PLANT" ? "PLT" : "B";
  const count = await prisma.seedlingBatch.count({ where: { nurseryId: cell.nurseryId } });
  const code = `${prefix}-${cell.zone.code}-${String(count + 1).padStart(3, "0")}`;

  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.seedlingBatch.create({
      data: {
        id: `batch-${code.toLowerCase()}`,
        code,
        speciesId: species.id,
        nurseryId: cell.nurseryId,
        zoneId: cell.zoneId,
        plantCellId: cell.id,
        quantity: parsed.data.quantity,
        source: parsed.data.source,
        plantingDate: new Date(parsed.data.plantingDate),
        growthStage: parsed.data.growthStage,
        healthStatus: parsed.data.healthStatus,
        notes: parsed.data.notes || null,
      },
    });

    await recordEvent(tx, {
      eventType: "PLANT_ADDED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: created.id,
      relatedEntityType: "SeedlingBatch",
      relatedEntityId: created.id,
      details: {
        code,
        species: species.commonName,
        quantity: parsed.data.quantity,
        cell: cell.code,
      },
    });

    const inventoryState = parsed.data.growthStage === "READY" ? "READY" : "IN_PRODUCTION";
    const inventory = await tx.inventoryItem.upsert({
      where: {
        nurseryId_speciesId_state: {
          nurseryId: cell.nurseryId,
          speciesId: species.id,
          state: inventoryState,
        },
      },
      update: { quantity: { increment: parsed.data.quantity } },
      create: {
        nurseryId: cell.nurseryId,
        speciesId: species.id,
        state: inventoryState,
        quantity: parsed.data.quantity,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        quantityChange: parsed.data.quantity,
        previousQuantity: inventory.quantity - parsed.data.quantity,
        newQuantity: inventory.quantity,
        reason: "Plant / batch added to zone",
        userId: user.id,
      },
    });

    await recordEvent(tx, {
      eventType: "INVENTORY_UPDATED",
      userId: user.id,
      nurseryId: cell.nurseryId,
      relatedEntityType: "InventoryItem",
      relatedEntityId: inventory.id,
      details: { species: species.commonName, state: inventoryState, added: parsed.data.quantity },
    });

    return created;
  });

  revalidatePath("/employee/zone");
  revalidatePath("/employee/inventory");
  revalidatePath("/supervisor");
  revalidatePath("/hq");
  redirect(`/employee/zone/${cell.id}?saved=plant&batch=${batch.code}`);
}
