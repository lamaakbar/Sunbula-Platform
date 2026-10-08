import Link from "next/link";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { AlertCard } from "@/components/data/OpsCards";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function EmployeeAlertsPage() {
  const { zone } = await employeeContext();
  const copy = messages(await getLocale());
  const alerts = await prisma.alert.findMany({
    where: { zoneId: zone.id, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: { plantCell: true, recommendations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow={zone.name}
        title={copy.employee.alertsTitle}
        description={copy.employee.alertsLead}
      />
      {alerts.length === 0 ? (
        <EmptyState
          title={copy.employee.noAlerts}
          description={copy.employee.noAlertsBody}
          action={
            <Link href="/employee/zone" className="font-semibold text-forest">
              {copy.employee.openMyZone}
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
