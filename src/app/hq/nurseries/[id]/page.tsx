import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getNurseryZoneCards } from "@/lib/data/cells";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, PageHeader, StatCard } from "@/components/ui/Feedback";
import { ZoneCard } from "@/components/data/Cards";
import { nurseryStatusFromScore } from "@/lib/domain/health";
import { numberFmt } from "@/lib/format";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HqNurseryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("HQ");
  const locale = await getLocale();
  const copy = messages(locale);
  const { id } = await params;
  const nursery = await prisma.nursery.findUnique({ where: { id } });
  if (!nursery) notFound();
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
            hint={`${item.summary.attention} cells need attention`}
          />
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">Latest field operations</h2>
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
