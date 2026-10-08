import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { AlertCard } from "@/components/data/OpsCards";

export default async function SupervisorAlertsPage() {
  const { nurseryId, nurseryName } = await supervisorContext();
  const copy = messages(await getLocale());
  const alerts = await prisma.alert.findMany({
    where: { nurseryId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: { zone: true, plantCell: true, recommendations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow={nurseryName} title={copy.supervisor.alertsTitle} description={copy.supervisor.alertsLead} />
      {alerts.length === 0 ? (
        <EmptyState title={copy.supervisor.noAlerts} description={copy.supervisor.noAlertsBody} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              title={`${alert.title} · ${alert.plantCell?.code ?? alert.zone?.name ?? ""}`}
              message={`${alert.message}${alert.recommendations[0] ? ` Recommendation: ${alert.recommendations[0].title}.` : ""}`}
              href={alert.zoneId ? `/supervisor/zones/${alert.zoneId}` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
