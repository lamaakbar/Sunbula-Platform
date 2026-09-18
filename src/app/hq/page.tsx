import { getNetworkOverview } from "@/lib/data/hq";
import { StatCard } from "@/components/ui/Feedback";
import { NurseryCard } from "@/components/data/Cards";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { numberFmt } from "@/lib/format";

export default async function HqHomePage() {
  const { cards, totals } = await getNetworkOverview();

  return (
    <div>
      <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-sand sm:p-8">
        <BotanicalMark className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 text-sage/25" variant="canopy" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">SUNBULA Network</p>
        <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold tracking-tight text-forest">
          {totals.nurseries} nurseries
        </h1>
        <p className="mt-2 max-w-xl text-muted">Network view first. Open a nursery only when you need to drill down.</p>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total production" value={numberFmt(totals.production)} />
        <StatCard label="Ready inventory" value={numberFmt(totals.ready)} tone="healthy" />
        <StatCard label="Needing attention" value={totals.attention} tone="attention" />
        <StatCard label="Critical alerts" value={totals.alerts} tone={totals.alerts ? "critical" : "default"} />
        <StatCard label="Pending requests" value={totals.pending} />
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <NurseryCard
            key={card.nursery.id}
            href={`/hq/nurseries/${card.nursery.id}`}
            name={card.nursery.name}
            health={card.health}
            production={`${card.summary.score}%`}
            readyStock={numberFmt(card.readyStock)}
            alerts={card.alerts}
          />
        ))}
      </section>
    </div>
  );
}
