import type { HealthStatus, Prisma } from "@prisma/client";
import { deriveHealth } from "@/lib/domain/health";
import { getKnowledge } from "@/lib/domain/knowledge";
import { prisma } from "@/lib/prisma";

export async function getZoneCells(zoneId: string) {
  const cells = await prisma.plantCell.findMany({
    where: { zoneId },
    orderBy: [{ rowIndex: "asc" }, { colIndex: "asc" }],
    include: {
      batches: {
        where: { isActive: true },
        include: { species: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      measurements: {
        orderBy: { timestamp: "desc" },
        take: 8,
      },
      alerts: {
        where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      },
    },
  });

  return Promise.all(
    cells.map(async (cell) => {
      const batch = cell.batches[0] ?? null;
      const moisture = cell.measurements.find((item) => item.metric === "SOIL_MOISTURE") ?? null;
      const knowledge = batch ? await getKnowledge(batch.speciesId, batch.growthStage) : null;
      const health = deriveHealth({
        lastReadingAt: moisture?.timestamp ?? cell.measurements[0]?.timestamp,
        moisture: moisture?.value,
        moistureRange: knowledge?.moisture ?? null,
        openCriticalAlerts: cell.alerts.filter((alert) => alert.severity === "CRITICAL").length,
        stored: batch?.healthStatus ?? null,
      });

      return {
        id: cell.id,
        code: cell.code,
        health,
        speciesName: batch?.species.commonName ?? "Empty cell",
        batchCode: batch?.code ?? null,
        quantity: batch?.quantity ?? 0,
        hasOpenAlert: cell.alerts.length > 0,
        lastMoisture: moisture?.value ?? null,
      };
    }),
  );
}

export async function getCellDetail(cellId: string) {
  const cell = await prisma.plantCell.findUnique({
    where: { id: cellId },
    include: {
      zone: true,
      nursery: true,
      batches: {
        where: { isActive: true },
        include: { species: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      measurements: {
        orderBy: { timestamp: "desc" },
        include: { recordedBy: true, sensor: true },
        take: 20,
      },
      operations: {
        orderBy: { occurredAt: "desc" },
        include: { user: true },
        take: 10,
      },
      alerts: {
        where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
        include: { recommendations: true },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        where: { status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] } },
        orderBy: { dueAt: "asc" },
      },
      images: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!cell) return null;
  const batch = cell.batches[0] ?? null;
  const knowledge = batch ? await getKnowledge(batch.speciesId, batch.growthStage) : null;
  const latestByMetric = new Map<string, (typeof cell.measurements)[number]>();
  for (const reading of cell.measurements) {
    if (!latestByMetric.has(reading.metric)) {
      latestByMetric.set(reading.metric, reading);
    }
  }

  const moisture = latestByMetric.get("SOIL_MOISTURE") ?? null;
  const health = deriveHealth({
    lastReadingAt: moisture?.timestamp ?? cell.measurements[0]?.timestamp,
    moisture: moisture?.value,
    moistureRange: knowledge?.moisture ?? null,
    openCriticalAlerts: cell.alerts.filter((alert) => alert.severity === "CRITICAL").length,
    stored: batch?.healthStatus ?? null,
  });

  return { cell, batch, knowledge, latestByMetric, health };
}

export function zoneHealthSummary(
  cells: Array<{ health: HealthStatus }>,
): { healthy: number; attention: number; critical: number; noData: number; score: number } {
  const healthy = cells.filter((cell) => cell.health === "HEALTHY").length;
  const attention = cells.filter((cell) => cell.health === "ATTENTION").length;
  const critical = cells.filter((cell) => cell.health === "CRITICAL").length;
  const noData = cells.filter((cell) => cell.health === "NO_RECENT_DATA").length;
  const score = cells.length === 0 ? 0 : Math.round((healthy / cells.length) * 100);
  return { healthy, attention, critical, noData, score };
}

export async function getNurseryZoneCards(nurseryId: string) {
  const zones = await prisma.zone.findMany({
    where: { nurseryId },
    orderBy: { code: "asc" },
  });

  return Promise.all(
    zones.map(async (zone) => {
      const cells = await getZoneCells(zone.id);
      const summary = zoneHealthSummary(cells);
      return { zone, cells, summary };
    }),
  );
}

export type EventWithUser = Prisma.EventHistoryGetPayload<{
  include: { user: true; plantCell: true; zone: true };
}>;
