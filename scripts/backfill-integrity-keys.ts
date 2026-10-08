import { PrismaClient } from "@prisma/client";
import { alertOpenKey, batchOpenSlot, taskOpenKey } from "../src/lib/integrity-keys";

const prisma = new PrismaClient();

async function main() {
  const updates = await prisma.batchUpdate.findMany({
    where: { status: { in: ["PENDING", "NEEDS_REVISION"] } },
    orderBy: { updatedAt: "desc" },
  });
  const seenBatches = new Set<string>();
  for (const row of updates) {
    if (seenBatches.has(row.batchId)) continue;
    seenBatches.add(row.batchId);
    await prisma.batchUpdate.update({
      where: { id: row.id },
      data: { openSlot: batchOpenSlot(row.status, row.batchId) },
    });
  }
  await prisma.batchUpdate.updateMany({
    where: { status: { in: ["APPROVED", "REJECTED"] }, NOT: { openSlot: null } },
    data: { openSlot: null },
  });

  const alerts = await prisma.alert.findMany({
    where: { status: { in: ["OPEN", "ACKNOWLEDGED"] }, plantCellId: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  const seenAlerts = new Set<string>();
  for (const alert of alerts) {
    if (!alert.plantCellId) continue;
    const key = alertOpenKey(alert.plantCellId, alert.type);
    if (seenAlerts.has(key)) continue;
    seenAlerts.add(key);
    await prisma.alert.update({ where: { id: alert.id }, data: { openKey: key } });
  }
  await prisma.alert.updateMany({
    where: { status: "RESOLVED", NOT: { openKey: null } },
    data: { openKey: null },
  });

  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] },
      plantCellId: { not: null },
      type: { not: "GENERAL" },
    },
    orderBy: { createdAt: "desc" },
  });
  const seenTasks = new Set<string>();
  for (const task of tasks) {
    if (!task.plantCellId) continue;
    const key = taskOpenKey(task.plantCellId, task.type);
    if (seenTasks.has(key)) continue;
    seenTasks.add(key);
    await prisma.task.update({ where: { id: task.id }, data: { openKey: key } });
  }
  await prisma.task.updateMany({
    where: { status: "COMPLETED", NOT: { openKey: null } },
    data: { openKey: null },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
