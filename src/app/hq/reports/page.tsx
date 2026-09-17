import { getNetworkOverview } from "@/lib/data/hq";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { requireRole } from "@/lib/auth/current-user";
import { numberFmt } from "@/lib/format";

export default async function HqReportsPage() {
  await requireRole("HQ");
  const { cards, totals } = await getNetworkOverview();

  return (
    <div>
      <PageHeader title="Network reports" description="Aggregated operational snapshot. Export tooling can be added later; the data is already live." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Nurseries" value={totals.nurseries} />
        <StatCard label="Production" value={numberFmt(totals.production)} />
        <StatCard label="Ready" value={numberFmt(totals.ready)} />
        <StatCard label="Alerts" value={totals.alerts} />
      </section>
      <div className="mt-8 overflow-hidden rounded-3xl border border-sand bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-light-sage text-forest">
            <tr>
              <th className="px-4 py-3 font-semibold">Nursery</th>
              <th className="px-4 py-3 font-semibold">Health</th>
              <th className="px-4 py-3 font-semibold">Ready</th>
              <th className="px-4 py-3 font-semibold">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.nursery.id} className="border-t border-sand">
                <td className="px-4 py-3">{card.nursery.name}</td>
                <td className="px-4 py-3">{card.summary.score}%</td>
                <td className="px-4 py-3">{numberFmt(card.readyStock)}</td>
                <td className="px-4 py-3">{card.alerts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
