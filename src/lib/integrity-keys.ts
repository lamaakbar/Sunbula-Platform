import { Prisma, type AlertType, type BatchUpdateStatus, type TaskType } from "@prisma/client";

export function batchOpenSlot(status: BatchUpdateStatus, batchId: string) {
  return status === "PENDING" || status === "NEEDS_REVISION" ? `batch:${batchId}` : null;
}

export function alertOpenKey(plantCellId: string, type: AlertType) {
  return `alert:${plantCellId}:${type}`;
}

export function taskOpenKey(plantCellId: string, type: TaskType) {
  return `task:${plantCellId}:${type}`;
}

export function batchSnapshotMatches(
  batch: { quantity: number; growthStage: string },
  update: { previousQuantity: number; previousStage: string },
) {
  return batch.quantity === update.previousQuantity && batch.growthStage === update.previousStage;
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
