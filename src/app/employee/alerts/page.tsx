import Link from "next/link";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { AlertCard } from "@/components/data/OpsCards";

export default async function EmployeeAlertsPage() {
  const { zone } = await employeeContext();
  const alerts = await prisma.alert.findMany({
    where: { zoneId: zone.id, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: { plantCell: true, recommendations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow={zone.name}
        title="Alerts"
        description="Issues in your assigned zone. Open the plant cell to record work or add a reading."
      />
      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts"
          description="Nothing in your zone currently needs attention."
          action={
            <Link href="/employee/zone" className="font-semibold text-forest">
              Open my zone
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              title={`${alert.title}${alert.plantCell ? ` · ${alert.plantCell.code}` : ""}`}
              message={`${alert.message}${alert.recommendations[0] ? ` Recommendation: ${alert.recommendations[0].title}.` : ""}`}
              href={alert.plantCellId ? `/employee/zone/${alert.plantCellId}` : "/employee/zone"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
