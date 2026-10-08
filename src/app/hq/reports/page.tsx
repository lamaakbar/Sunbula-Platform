import { getNetworkOverview } from "@/lib/data/hq";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { requireRole } from "@/lib/auth/current-user";
import { numberFmt } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HqReportsPage() {
  await requireRole("HQ");
  const { cards, totals } = await getNetworkOverview();
  const copy = messages(await getLocale());

  return (
    <div>
      <PageHeader title={copy.hq.reportsTitle} description={copy.hq.reportsLead} />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={copy.hq.nurseries} value={totals.nurseries} />
        <StatCard label={copy.hq.production} value={numberFmt(totals.production)} />
        <StatCard label={copy.growth.READY} value={numberFmt(totals.ready)} />
        <StatCard label={copy.supervisor.alertsTitle} value={totals.alerts} />
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
