import { prisma } from "@/lib/prisma";

export async function weeklyInspections(nurseryId: string) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.healthAssessment.findMany({
    where: {
      assessedAt: { gte: since },
      plantCell: { nurseryId },
    },
    select: { status: true, plantCell: { select: { zoneId: true } } },
  });
  const zones = new Set(
    rows
      .filter((row) => row.status === "ATTENTION" || row.status === "CRITICAL")
      .map((row) => row.plantCell?.zoneId)
      .filter((id): id is string => Boolean(id)),
  );
  return {
    checked: rows.length,
    followUp: rows.filter((row) => row.status === "ATTENTION" || row.status === "CRITICAL").length,
    zones: zones.size,
  };
}
