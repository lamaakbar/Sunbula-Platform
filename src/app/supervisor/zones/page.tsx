import Link from "next/link";
import { getSupervisorOverview } from "@/lib/data/supervisor";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { ZoneCard } from "@/components/data/Cards";
import { nurseryStatusFromScore } from "@/lib/domain/health";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function SupervisorZonesPage() {
  const data = await getSupervisorOverview();
  const copy = messages(await getLocale());

  return (
    <div>
      <PageHeader title={copy.supervisor.zonesTitle} description={copy.supervisor.zonesLead} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.zones.map((item) => (
          <div key={item.zone.id} className="space-y-3">
            <ZoneCard
              href={`/supervisor/zones/${item.zone.id}`}
              name={item.zone.name}
              score={item.summary.score}
              health={nurseryStatusFromScore(item.summary.score)}
            />
            <div className="grid grid-cols-2 gap-2">
              <StatCard label={copy.supervisor.attention} value={item.summary.attention} />
              <StatCard label={copy.supervisor.critical} value={item.summary.critical} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">
        Looking for network comparison? That lives with HQ. Your scope stays on{" "}
        <Link className="font-semibold text-forest" href="/supervisor">
          {data.nurseryName}
        </Link>
        .
      </p>
    </div>
  );
}
