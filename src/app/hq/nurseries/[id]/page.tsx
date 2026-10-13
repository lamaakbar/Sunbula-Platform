import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getNurseryZoneCards } from "@/lib/data/cells";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, PageHeader, StatCard } from "@/components/ui/Feedback";
import { ZoneCard } from "@/components/data/Cards";
import { CellGround } from "@/components/ground/CellGround";
import { WeatherStrip } from "@/components/ground/WeatherStrip";
import { getNurseryWeather } from "@/lib/weather/open-meteo";
import { nurseryStatusFromScore } from "@/lib/domain/health";
import { numberFmt } from "@/lib/format";
import { groundCopy } from "@/lib/ground-copy";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HqNurseryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("HQ");
  const locale = await getLocale();
  const copy = messages(locale);
  const ground = groundCopy(locale);
  const { id } = await params;
  const nursery = await prisma.nursery.findUnique({ where: { id } });
  if (!nursery) notFound();
  const weather = await getNurseryWeather(nursery.id, locale);
  const zones = await getNurseryZoneCards(nursery.id);
  const operations = await prisma.dailyOperation.findMany({
    where: { nurseryId: nursery.id },
    include: { user: true, plantCell: true, zone: true },
    orderBy: { occurredAt: "desc" },
    take: 10,
  });
  const ready = await prisma.inventoryItem.aggregate({
    where: { nurseryId: nursery.id, state: "READY" },
    _sum: { quantity: true },
  });

  return (
    <div>
      <Breadcrumbs items={[{ href: "/hq", label: copy.chrome.network }, { label: nursery.name }]} />
      <PageHeader title={nursery.name} description={`${nursery.region} · ${copy.hq.drill}`} />
      <WeatherStrip
        title={ground.weatherTitle}
        lead={ground.weatherLead}
        reports={weather ? [weather] : []}
        copy={ground}
        names={{ [nursery.id]: nursery.name }}
      />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={copy.hq.readyStock} value={numberFmt(ready._sum.quantity ?? 0)} />
        <StatCard label={copy.hq.zones} value={zones.length} />
        <StatCard label={copy.hq.recentOps} value={operations.length} />
        <StatCard label={copy.hq.capacity} value={numberFmt(nursery.capacity)} />
      </section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {zones.map((item) => (
          <ZoneCard
            key={item.zone.id}
            href={`/hq/nurseries/${nursery.id}?zone=${item.zone.id}`}
            name={item.zone.name}
            score={item.summary.score}
            health={nurseryStatusFromScore(item.summary.score)}
            hint={`${item.summary.attention} ${copy.supervisor.attention}`}
          />
        ))}
      </div>
      <section className="mt-8 space-y-8">
        <p className="text-sm leading-6 text-muted">{ground.groundLead}</p>
        {zones.map((item) => (
          <div key={item.zone.id}>
            <h2 className="mb-3 text-lg font-semibold text-forest">{item.zone.name}</h2>
            <CellGround
              cells={item.cells}
              hrefFor={(cell) => (cell.batchCode ? `/hq/plant/${cell.batchCode}` : null)}
              emptyLabel={ground.emptyCell}
              stageLabel={(stage) => copy.growth[stage]}
            />
          </div>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">{copy.hq.recentOps}</h2>
        <ul className="mt-4 space-y-3">
          {operations.map((op) => (
            <li key={op.id} className="rounded-3xl border border-sand bg-white px-5 py-4">
              <p className="font-semibold text-forest">
                {copy.operation[op.type]} · {op.zone.name} {op.plantCell ? `· ${op.plantCell.code}` : ""}
              </p>
              <p className="text-sm text-muted">
                {op.user.fullName} · {relativeText(locale, op.occurredAt)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
