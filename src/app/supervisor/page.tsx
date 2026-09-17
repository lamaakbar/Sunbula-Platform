import Link from "next/link";
import { getSupervisorOverview } from "@/lib/data/supervisor";
import { greetingFor, numberFmt, operationLabel, relativeTime } from "@/lib/format";
import { StatCard } from "@/components/ui/Feedback";
import { ZoneCard } from "@/components/data/Cards";
import { AlertCard } from "@/components/data/OpsCards";
import { BotanicalMark, SectionHeading } from "@/components/brand/BotanicalMark";
import { nurseryStatusFromScore } from "@/lib/domain/health";

export default async function SupervisorHomePage() {
  const data = await getSupervisorOverview();
  const firstName = data.user.fullName.split(" ")[0];

  return (
    <div>
      <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-sand sm:p-8">
        <BotanicalMark className="pointer-events-none absolute -right-10 -top-8 h-48 w-48 text-sage/25" variant="canopy" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{data.nurseryName}</p>
        <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold tracking-tight text-forest">
          {greetingFor()}, {firstName}.
        </h1>
        <p className="mt-2 max-w-xl text-muted">Here is what needs your attention today.</p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total seedlings" value={numberFmt(data.totalSeedlings)} />
        <StatCard label="In production" value={numberFmt(data.inProduction)} />
        <StatCard label="Ready stock" value={numberFmt(data.ready)} tone="healthy" />
        <StatCard label="Needs attention" value={data.summary.attention + data.summary.critical} tone="attention" />
        <StatCard label="Active alerts" value={data.alerts.length} tone={data.alerts.length ? "attention" : "default"} />
        <StatCard label="Tasks today" value={data.tasksToday.length} />
      </section>

      <section className="mt-10">
        <SectionHeading title="Needs your attention" description="Act on these before the rest of the nursery view." />
        <div className="grid gap-4 lg:grid-cols-3">
          {data.alerts.slice(0, 3).map((alert) => (
            <AlertCard
              key={alert.id}
              title={`${alert.severity === "HIGH" || alert.severity === "CRITICAL" ? "High priority" : "Medium"} · ${alert.zone?.name ?? data.nurseryName}`}
              message={alert.message}
              href={alert.zoneId ? `/supervisor/zones/${alert.zoneId}` : "/supervisor/alerts"}
            />
          ))}
          {data.overdue > 0 ? (
            <AlertCard
              title={`Medium · ${data.overdue} overdue employee tasks`}
              message="Some assigned work is past its required time."
              href="/supervisor/employees"
            />
          ) : null}
          {data.batches.filter((item) => item.growthStage === "READY").slice(0, 1).map((batch) => (
            <article key={batch.id} className="rounded-[1.7rem] bg-light-sage/50 p-5 ring-1 ring-sage/40">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">Information</p>
              <p className="mt-2 font-semibold text-forest">{batch.code}</p>
              <p className="mt-1 text-sm text-muted">Approaching or already at ready stage.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          title="Nursery health"
          action={
            <Link href="/supervisor/zones" className="text-sm font-semibold text-forest">
              Compare zones
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
              hint={`${item.cells.length} cells`}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title="Recent field activity" />
        {data.operations.length === 0 ? (
          <p className="text-sm text-muted">No operations recorded yet today.</p>
        ) : (
          <ul className="space-y-3">
            {data.operations.map((op) => (
              <li key={op.id} className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-sand">
                <p className="font-semibold text-forest">
                  {operationLabel[op.type]} · {op.plantCell?.code ?? op.zone.name}
                </p>
                <p className="text-sm text-muted">
                  {op.user.fullName} · {relativeTime(op.occurredAt)}
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
