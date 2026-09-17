import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { AlertCard } from "@/components/data/OpsCards";

export default async function SupervisorAlertsPage() {
  const { nurseryId, nurseryName } = await supervisorContext();
  const alerts = await prisma.alert.findMany({
    where: { nurseryId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: { zone: true, plantCell: true, recommendations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader eyebrow={nurseryName} title="Alerts" description="Actionable issues in your nursery. Recommendations explain what triggered them." />
      {alerts.length === 0 ? (
        <EmptyState title="No alerts" description="No plants currently require attention." />
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
