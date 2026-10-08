import { requireRole } from "@/lib/auth/current-user";
import { getZoneCells, zoneHealthSummary } from "@/lib/data/cells";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function employeeContext() {
  const user = await requireRole("EMPLOYEE");
  const zones = user.assignedZones;
  const zone = zones[0] ?? null;
  if (!user.nurseryId || !zone) notFound();
  return {
    user,
    zone,
    zones,
    zoneIds: zones.map((item) => item.id),
    zoneLabel: zones.map((item) => item.name).join(" · "),
    nurseryId: user.nurseryId,
    nurseryName: user.nurseryName ?? "Nursery",
  };
}

export async function getEmployeeHome() {
  const ctx = await employeeContext();
  const grouped = await Promise.all(ctx.zoneIds.map((zoneId) => getZoneCells(zoneId)));
  const cells = grouped.flat();
  const summary = zoneHealthSummary(cells);

  const [tasks, alerts, operationsToday, moisture, updates] = await Promise.all([
    prisma.task.findMany({
      where: {
        assigneeId: ctx.user.id,
        status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      },
      include: { plantCell: true, zone: true, batch: { include: { species: true } } },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
    }),
    prisma.alert.count({
      where: { zoneId: { in: ctx.zoneIds }, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    }),
    prisma.dailyOperation.count({
      where: {
        zoneId: { in: ctx.zoneIds },
        occurredAt: { gte: startOfDay() },
      },
    }),
    prisma.plantMeasurement.findMany({
      where: { zoneId: { in: ctx.zoneIds }, metric: "SOIL_MOISTURE", qualityStatus: "VALID" },
      orderBy: { timestamp: "desc" },
      take: 80,
    }),
    prisma.batchUpdate.findMany({
      where: { submittedById: ctx.user.id, zoneId: { in: ctx.zoneIds } },
      select: { status: true },
    }),
  ]);

  const avgMoisture =
    moisture.length === 0
      ? null
      : Math.round(moisture.reduce((sum, item) => sum + item.value, 0) / moisture.length);

  return {
    ...ctx,
    cells,
    summary,
    tasks,
    alerts,
    operationsToday,
    avgMoisture,
    pendingUpdates: updates.filter((item) => item.status === "PENDING").length,
    revisionUpdates: updates.filter((item) => item.status === "NEEDS_REVISION").length,
  };
}

export function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
