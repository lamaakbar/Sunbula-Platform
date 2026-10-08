import Link from "next/link";
import { getSupervisorOverview } from "@/lib/data/supervisor";
import { numberFmt } from "@/lib/format";
import { greetingText, messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { StatCard } from "@/components/ui/Feedback";
import { ZoneCard } from "@/components/data/Cards";
import { AlertCard } from "@/components/data/OpsCards";
import { BotanicalMark, SectionHeading } from "@/components/brand/BotanicalMark";
import { nurseryStatusFromScore } from "@/lib/domain/health";

export default async function SupervisorHomePage() {
  const data = await getSupervisorOverview();
  const locale = await getLocale();
  const copy = messages(locale);
  const firstName = data.user.fullName.split(" ")[0];

  return (
    <div>
      <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-sand sm:p-8">
        <BotanicalMark className="pointer-events-none absolute -right-10 -top-8 h-48 w-48 text-sage/25" variant="canopy" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{data.nurseryName}</p>
        <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold tracking-tight text-forest">
          {greetingText(locale)}, {firstName}.
        </h1>
        <p className="mt-2 max-w-xl text-muted">{copy.supervisor.lead}</p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={copy.supervisor.seedlings} value={numberFmt(data.totalSeedlings)} />
        <StatCard label={copy.supervisor.inProduction} value={numberFmt(data.inProduction)} />
        <StatCard label={copy.supervisor.ready} value={numberFmt(data.ready)} tone="healthy" />
        <StatCard label={copy.supervisor.needsAttention} value={data.summary.attention + data.summary.critical} tone="attention" />
        <Link href="/supervisor/alerts" className="block">
          <StatCard label={copy.supervisor.alerts} value={data.alerts.length} tone={data.alerts.length ? "attention" : "default"} />
        </Link>
        <Link href="/supervisor/employees" className="block">
          <StatCard label={copy.supervisor.tasks} value={data.tasksToday.length} />
        </Link>
        <Link href="/supervisor/updates?tab=PENDING" className="block">
          <StatCard
            label={copy.supervisor.pending}
            value={data.pendingUpdates}
            tone={data.pendingUpdates ? "attention" : "default"}
            hint={copy.supervisor.pendingHint}
          />
        </Link>
      </section>

      <section className="mt-10">
        <SectionHeading title={copy.supervisor.act} description={copy.supervisor.actLead} />
        <div className="grid gap-4 lg:grid-cols-3">
          {data.alerts.slice(0, 3).map((alert) => (
            <AlertCard
              key={alert.id}
              title={`${alert.severity === "HIGH" || alert.severity === "CRITICAL" ? copy.supervisor.high : copy.supervisor.medium} · ${alert.zone?.name ?? data.nurseryName}`}
              message={alert.message}
              href={alert.zoneId ? `/supervisor/zones/${alert.zoneId}` : "/supervisor/alerts"}
            />
          ))}
          {data.pendingUpdates > 0 ? (
            <AlertCard
              title={`${data.pendingUpdates} ${copy.supervisor.waiting}`}
              message={copy.supervisor.reviewBody}
              href="/supervisor/updates?tab=PENDING"
            />
          ) : null}
          {data.overdue > 0 ? (
            <AlertCard
              title={`${copy.supervisor.medium} · ${data.overdue} ${copy.supervisor.overdue}`}
              message={copy.supervisor.overdueBody}
              href="/supervisor/employees"
            />
          ) : null}
          {data.batches.filter((item) => item.growthStage === "READY").slice(0, 1).map((batch) => (
            <article key={batch.id} className="rounded-[1.7rem] bg-light-sage/50 p-5 ring-1 ring-sage/40">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">{copy.supervisor.information}</p>
              <p className="mt-2 font-semibold text-forest">{batch.code}</p>
              <p className="mt-1 text-sm text-muted">{copy.supervisor.readyStage}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          title={copy.supervisor.health}
          action={
            <Link href="/supervisor/zones" className="text-sm font-semibold text-forest">
              {copy.supervisor.compare}
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.zones.map((item) => (
            <ZoneCard
              key={item.zone.id}
              href={`/supervisor/zones/${item.zone.id}`}
              name={item.zone.name}
              score={item.summary.score}
              health={nurseryStatusFromScore(item.summary.score)}
              hint={`${item.cells.length} ${copy.supervisor.cells}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title={copy.supervisor.activity} />
        {data.operations.length === 0 ? (
          <p className="text-sm text-muted">{copy.supervisor.noOps}</p>
        ) : (
          <ul className="space-y-3">
            {data.operations.map((op) => (
              <li key={op.id} className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-sand">
                <p className="font-semibold text-forest">
                  {copy.operation[op.type]} · {op.plantCell?.code ?? op.zone.name}
                </p>
                <p className="text-sm text-muted">
                  {op.user.fullName} · {relativeText(locale, op.occurredAt)}
                  {op.notes ? ` · ${op.notes}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
