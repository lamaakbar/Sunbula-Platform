import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { StatCard } from "@/components/ui/Feedback";
import { getNurseryZoneCards, zoneHealthSummary } from "@/lib/data/cells";
import { weeklyInspections } from "@/lib/data/inspections";
import { nurseryStatusFromScore } from "@/lib/domain/health";
import { numberFmt } from "@/lib/format";
import { groundCopy } from "@/lib/ground-copy";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { HealthBadge } from "@/components/data/HealthBadge";
import { WeatherStrip } from "@/components/ground/WeatherStrip";
import { getNurseryWeather } from "@/lib/weather/open-meteo";

export async function NurserySummary({ nurseryId }: { nurseryId: string }) {
  const user = await requireUser();
  const locale = await getLocale();
  const copy = messages(locale);
  const ground = groundCopy(locale);
  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });
  if (!nursery) notFound();

  if (user.role === "HQ") redirect(`/hq/nurseries/${nursery.id}`);
  if (user.nurseryId === nursery.id) {
    redirect(user.role === "EMPLOYEE" ? "/employee/zone" : "/supervisor/zones");
  }

  const zones = await getNurseryZoneCards(nursery.id);
  const summary = zoneHealthSummary(zones.flatMap((item) => item.cells));
  const [ready, alerts, plants, week] = await Promise.all([
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
    weeklyInspections(nursery.id),
  ]);
  const home = user.role === "SUPERVISOR" ? "/supervisor" : "/employee";
  const weather = await getNurseryWeather(nursery.id, locale);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{ground.summaryOnly}</p>
      <h1 className="mt-2 text-3xl font-semibold text-forest">{nursery.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{ground.lockedLead}</p>
      <div className="mt-4">
        <HealthBadge status={nurseryStatusFromScore(summary.score)} />
      </div>
      <WeatherStrip
        title={ground.weatherTitle}
        lead={ground.weatherLead}
        reports={weather ? [weather] : []}
        copy={ground}
        names={{ [nursery.id]: nursery.name }}
      />
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={copy.hq.production} value={numberFmt(plants._sum.quantity ?? 0)} />
        <StatCard label={copy.supervisor.readyStock} value={numberFmt(ready._sum.quantity ?? 0)} />
        <StatCard label={copy.supervisor.openAlerts} value={alerts} tone={alerts ? "attention" : "default"} />
        <StatCard label={ground.weekFollow} value={week.followUp} />
      </section>
      <ul className="mt-6 space-y-2">
        {zones.map((item) => (
          <li key={item.zone.id} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-sand">
            <p className="font-semibold text-forest">{item.zone.name}</p>
            <p className="text-sm text-muted">
              {item.summary.score}% · {item.summary.attention + item.summary.critical} {copy.supervisor.attention}
            </p>
          </li>
        ))}
      </ul>
      <Link href={home} className="mt-6 inline-flex text-sm font-semibold text-forest">
        {copy.common.home}
      </Link>
    </div>
  );
}
