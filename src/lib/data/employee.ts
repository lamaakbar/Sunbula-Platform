import { requireRole } from "@/lib/auth/current-user";
import { employeePrimaryZone } from "@/lib/auth/rbac";
import { getZoneCells, zoneHealthSummary } from "@/lib/data/cells";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function employeeContext() {
  const user = await requireRole("EMPLOYEE");
  const zone = employeePrimaryZone(user);
  if (!user.nurseryId || !zone) notFound();
  return { user, zone, nurseryId: user.nurseryId, nurseryName: user.nurseryName ?? "Nursery" };
}

export async function getEmployeeHome() {
  const ctx = await employeeContext();
  const cells = await getZoneCells(ctx.zone.id);
  const summary = zoneHealthSummary(cells);

  const [tasks, alerts, operationsToday, moisture] = await Promise.all([
    prisma.task.findMany({
      where: {
        assigneeId: ctx.user.id,
        status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      },
      include: { plantCell: true, zone: true, batch: { include: { species: true } } },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
    }),
    prisma.alert.count({
      where: { zoneId: ctx.zone.id, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    }),
    prisma.dailyOperation.count({
      where: {
        zoneId: ctx.zone.id,
        occurredAt: { gte: startOfDay() },
      },
    }),
    prisma.plantMeasurement.findMany({
      where: { zoneId: ctx.zone.id, metric: "SOIL_MOISTURE" },
      orderBy: { timestamp: "desc" },
      take: 80,
    }),
  ]);

  const avgMoisture =
    moisture.length === 0
      ? null
      : Math.round(moisture.reduce((sum, item) => sum + item.value, 0) / moisture.length);

  return { ...ctx, cells, summary, tasks, alerts, operationsToday, avgMoisture };
}

export function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
