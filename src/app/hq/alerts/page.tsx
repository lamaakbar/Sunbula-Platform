import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { AlertCard } from "@/components/data/OpsCards";

export default async function HqAlertsPage() {
  await requireRole("HQ");
  const alerts = await prisma.alert.findMany({
    where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: { nursery: true, zone: true, plantCell: true },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader title="Network alerts" description="High-level issues across nurseries. Open a nursery to act in context." />
      {alerts.length === 0 ? (
        <EmptyState title="No alerts" description="No plants currently require network-level attention." />
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
