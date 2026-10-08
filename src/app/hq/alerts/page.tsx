import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { AlertCard } from "@/components/data/OpsCards";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HqAlertsPage() {
  await requireRole("HQ");
  const copy = messages(await getLocale());
  const alerts = await prisma.alert.findMany({
    where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: { nursery: true, zone: true, plantCell: true },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader title={copy.hq.alertsTitle} description={copy.hq.alertsLead} />
      {alerts.length === 0 ? (
        <EmptyState title={copy.hq.noAlerts} description={copy.hq.noAlertsBody} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              title={`${alert.nursery.name} · ${alert.title}`}
              message={`${alert.zone?.name ?? ""} ${alert.plantCell ? alert.plantCell.code : ""} — ${alert.message}`}
              href={`/hq/nurseries/${alert.nurseryId}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
