import Link from "next/link";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { ReadingCard } from "@/components/data/OpsCards";
import { getKnowledge } from "@/lib/domain/knowledge";
import { metricLabel, relativeTime, sourceLabel } from "@/lib/format";
import { readingMeaning } from "@/services/data-quality";
import { rangeForMetric } from "@/services/recommendations";

export default async function MonitoringPage() {
  const { zone } = await employeeContext();
  const readings = await prisma.plantMeasurement.findMany({
    where: { zoneId: zone.id },
    include: { plantCell: true, recordedBy: true, batch: { include: { species: true } } },
    orderBy: { timestamp: "desc" },
    take: 24,
  });

  return (
    <div>
      <PageHeader title="Zone readings" description="Sensor and manual readings for your assigned zone. Sensor values do not need to be typed again." />
      {readings.length === 0 ? (
        <EmptyState
          title="No readings have been recorded yet."
          description="When a sensor reports, or you add a manual reading, it will appear here."
          action={
            <Link href="/employee/zone" className="font-semibold text-forest">
              Add manual reading from a cell
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {await Promise.all(
            readings.map(async (reading) => {
              const knowledge = reading.batch
                ? await getKnowledge(reading.batch.speciesId, reading.batch.growthStage)
                : null;
              const range = rangeForMetric(knowledge, reading.metric);
              const meaning = readingMeaning(reading.value, range);
              return (
                <ReadingCard
                  key={reading.id}
                  label={`${metricLabel[reading.metric]} · ${reading.plantCell?.code ?? zone.name}`}
                  value={String(reading.value)}
                  unit={reading.unit}
                  meaning={meaning}
                  expected={range ? `${range.min}–${range.max}` : undefined}
                  source={`${sourceLabel[reading.source]}${reading.recordedBy ? ` · ${reading.recordedBy.fullName}` : ""}`}
                  updated={relativeTime(reading.timestamp)}
                  href={reading.plantCellId ? `/employee/zone/${reading.plantCellId}` : undefined}
                />
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
