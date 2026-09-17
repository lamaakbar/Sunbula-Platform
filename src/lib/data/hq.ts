import { getNurseryZoneCards, zoneHealthSummary } from "@/lib/data/cells";
import { nurseryStatusFromScore } from "@/lib/domain/health";
import { prisma } from "@/lib/prisma";

export async function getNetworkOverview() {
  const nurseries = await prisma.nursery.findMany({ orderBy: { name: "asc" } });

  const cards = await Promise.all(
    nurseries.map(async (nursery) => {
      const zones = await getNurseryZoneCards(nursery.id);
      const cells = zones.flatMap((item) => item.cells);
      const summary = zoneHealthSummary(cells);
      const [ready, alerts, batches, requests] = await Promise.all([
        prisma.inventoryItem.aggregate({
          where: { nurseryId: nursery.id, state: "READY" },
          _sum: { quantity: true },
        }),
        prisma.alert.count({
          where: { nurseryId: nursery.id, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
        }),
        prisma.seedlingBatch.aggregate({
          where: { nurseryId: nursery.id, isActive: true },
          _sum: { quantity: true },
        }),
        prisma.seedlingRequest.count({
          where: { nurseryId: nursery.id, status: "PENDING" },
        }),
      ]);

      const productionScore = Math.min(100, Math.round((summary.score + (ready._sum.quantity ? 8 : 0)) / 1));
      return {
        nursery,
        summary,
        health: nurseryStatusFromScore(summary.score),
        readyStock: ready._sum.quantity ?? 0,
        alerts,
        production: productionScore,
        totalPlants: batches._sum.quantity ?? 0,
        pendingRequests: requests,
        operationsToday: await prisma.dailyOperation.count({
          where: {
            nurseryId: nursery.id,
            occurredAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
      };
    }),
  );

  return {
    cards,
    totals: {
      nurseries: cards.length,
      production: cards.reduce((sum, item) => sum + item.totalPlants, 0),
      ready: cards.reduce((sum, item) => sum + item.readyStock, 0),
      attention: cards.reduce((sum, item) => sum + item.summary.attention + item.summary.critical, 0),
      alerts: cards.reduce((sum, item) => sum + item.alerts, 0),
      pending: cards.reduce((sum, item) => sum + item.pendingRequests, 0),
    },
  };
}
