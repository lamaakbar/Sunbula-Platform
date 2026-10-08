import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleZone } from "@/lib/auth/rbac";
import { getZoneCells, zoneHealthSummary } from "@/lib/data/cells";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, PageHeader, StatCard } from "@/components/ui/Feedback";
import { PlantCellCard } from "@/components/data/Cards";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function SupervisorZoneDetailPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const user = await requireRole("SUPERVISOR");
  const locale = await getLocale();
  const copy = messages(locale);
  const { zoneId } = await params;
  const zone = await getAccessibleZone(user, zoneId);
  const cells = await getZoneCells(zone.id);
  const summary = zoneHealthSummary(cells);
  const operations = await prisma.dailyOperation.findMany({
    where: { zoneId: zone.id },
    include: { user: true, plantCell: true },
    orderBy: { occurredAt: "desc" },
    take: 8,
  });

  if (!zone) notFound();

  return (
    <div>
      <Breadcrumbs items={[{ href: "/supervisor", label: zone.nursery.name }, { href: "/supervisor/zones", label: copy.supervisor.zonesTitle }, { label: zone.name }]} />
      <PageHeader title={zone.name} description={copy.supervisor.zoneLead} />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={copy.supervisor.healthy} value={summary.healthy} tone="healthy" />
        <StatCard label={copy.supervisor.attention} value={summary.attention} tone="attention" />
        <StatCard label={copy.supervisor.critical} value={summary.critical} tone="critical" />
        <StatCard label={copy.supervisor.score} value={`${summary.score}%`} />
      </section>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {cells.map((cell) => (
          <PlantCellCard
            key={cell.id}
            href={`/supervisor/zones/${zone.id}?cell=${cell.id}`}
            code={cell.code}
            health={cell.health}
            speciesName={cell.speciesName}
          />
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">{copy.hq.recentOps}</h2>
        <ul className="mt-4 space-y-3">
          {operations.map((op) => (
            <li key={op.id} className="rounded-3xl border border-sand bg-white px-5 py-4">
              <p className="font-semibold text-forest">
                {copy.operation[op.type]} · {op.plantCell?.code ?? zone.name}
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
