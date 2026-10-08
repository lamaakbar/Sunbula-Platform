import Link from "next/link";
import { getNetworkOverview } from "@/lib/data/hq";
import { StatCard } from "@/components/ui/Feedback";
import { NurseryCard } from "@/components/data/Cards";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { numberFmt } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HqHomePage() {
  const { cards, totals } = await getNetworkOverview();
  const copy = messages(await getLocale());

  return (
    <div>
      <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-sand sm:p-8">
        <BotanicalMark className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 text-sage/25" variant="canopy" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{copy.chrome.network}</p>
        <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.6rem)] font-semibold tracking-tight text-forest">
          {totals.nurseries} {copy.hq.nurseries}
        </h1>
        <p className="mt-2 max-w-xl text-muted">{copy.hq.lead}</p>
      </section>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Link href="/hq/reports" className="block">
          <StatCard label={copy.hq.production} value={numberFmt(totals.production)} />
        </Link>
        <Link href="/hq/reports" className="block">
          <StatCard label={copy.hq.ready} value={numberFmt(totals.ready)} tone="healthy" />
        </Link>
        <Link href="/hq/alerts" className="block">
          <StatCard label={copy.hq.attention} value={totals.attention} tone="attention" />
        </Link>
        <Link href="/hq/alerts" className="block">
          <StatCard label={copy.hq.alerts} value={totals.alerts} tone={totals.alerts ? "critical" : "default"} />
        </Link>
        <Link href="/hq/requests?tab=PENDING" className="block">
          <StatCard label={copy.hq.pending} value={totals.pending} tone={totals.pending ? "attention" : "default"} />
        </Link>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-forest">{copy.hq.intervene}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {cards
            .filter((card) => card.alerts > 0 || card.pendingRequests > 0)
            .map((card) => (
              <Link
                key={card.nursery.id}
                href={card.alerts > 0 ? `/hq/nurseries/${card.nursery.id}` : "/hq/requests?tab=PENDING"}
                className="rounded-[1.5rem] bg-white px-5 py-4 ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-sage"
              >
                <p className="font-semibold text-forest">{card.nursery.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {card.alerts} {copy.supervisor.openAlerts} · {card.pendingRequests} {copy.supervisor.pendingRequests} · {copy.supervisor.readyStock} {numberFmt(card.readyStock)}
                </p>
              </Link>
            ))}
        </div>
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
