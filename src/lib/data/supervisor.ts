import { requireRole } from "@/lib/auth/current-user";
import { getNurseryZoneCards, zoneHealthSummary } from "@/lib/data/cells";
import { startOfDay } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { nurseryStatusFromScore } from "@/lib/domain/health";

export async function supervisorContext() {
  const user = await requireRole("SUPERVISOR");
  if (!user.nurseryId || !user.nurseryName) notFound();
  return { user, nurseryId: user.nurseryId, nurseryName: user.nurseryName };
}

export async function getSupervisorOverview() {
  const ctx = await supervisorContext();
  const zones = await getNurseryZoneCards(ctx.nurseryId);
  const allCells = zones.flatMap((item) => item.cells);
  const summary = zoneHealthSummary(allCells);

  const [batches, inventory, alerts, tasksToday, operations, overdue, pendingUpdates] = await Promise.all([
    prisma.seedlingBatch.findMany({
      where: { nurseryId: ctx.nurseryId, isActive: true },
    }),
    prisma.inventoryItem.findMany({
      where: { nurseryId: ctx.nurseryId },
      include: { species: true },
    }),
    prisma.alert.findMany({
      where: { nurseryId: ctx.nurseryId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      include: { zone: true, plantCell: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        nurseryId: ctx.nurseryId,
        status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      },
      include: { assignee: true, zone: true, plantCell: true },
    }),
    prisma.dailyOperation.findMany({
      where: { nurseryId: ctx.nurseryId, occurredAt: { gte: startOfDay() } },
      include: { user: true, plantCell: true, zone: true },
      orderBy: { occurredAt: "desc" },
      take: 12,
    }),
    prisma.task.count({
      where: { nurseryId: ctx.nurseryId, status: "OVERDUE" },
    }),
    prisma.batchUpdate.count({
      where: { nurseryId: ctx.nurseryId, status: "PENDING" },
    }),
  ]);

  const totalSeedlings = batches.reduce((sum, item) => sum + item.quantity, 0);
  const inProduction = inventory.filter((item) => item.state === "IN_PRODUCTION").reduce((sum, item) => sum + item.quantity, 0);
  const ready = inventory.filter((item) => item.state === "READY").reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...ctx,
    zones,
    summary,
    health: nurseryStatusFromScore(summary.score),
    totalSeedlings,
    inProduction,
    ready,
    alerts,
    tasksToday,
    operations,
    overdue,
    pendingUpdates,
    inventory,
    batches,
  };
}
