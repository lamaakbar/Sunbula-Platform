import Link from "next/link";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { ReadingCard } from "@/components/data/OpsCards";
import { getKnowledge } from "@/lib/domain/knowledge";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { readingMeaning } from "@/services/data-quality";
import { rangeForMetric } from "@/services/recommendations";

export default async function MonitoringPage() {
  const { zoneLabel, zoneIds } = await employeeContext();
  const locale = await getLocale();
  const copy = messages(locale);
  const readings = await prisma.plantMeasurement.findMany({
    where: { zoneId: { in: zoneIds } },
    include: { plantCell: true, recordedBy: true, batch: { include: { species: true } } },
    orderBy: { timestamp: "desc" },
    take: 24,
  });

  return (
    <div>
      <PageHeader title={copy.employee.readingsTitle} description={copy.employee.readingsLead} />
      {readings.length === 0 ? (
        <EmptyState
          title={copy.employee.noReadings}
          description={copy.employee.noReadingsBody}
          action={
            <Link href="/employee/zone" className="font-semibold text-forest">
              {copy.employee.addReadingLink}
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
                  label={`${copy.metric[reading.metric]} · ${reading.plantCell?.code ?? zoneLabel}`}
                  value={String(reading.value)}
                  unit={reading.unit}
                  meaning={meaning}
                  expected={range ? `${range.min}–${range.max}` : undefined}
                  source={`${copy.source[reading.source]}${reading.recordedBy ? ` · ${reading.recordedBy.fullName}` : ""}`}
                  quality={copy.quality[reading.qualityStatus]}
                  updated={relativeText(locale, reading.timestamp)}
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
