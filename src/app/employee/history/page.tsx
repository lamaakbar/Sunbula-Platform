import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { parseEventDetails } from "@/services/events";

export default async function HistoryPage() {
  const { user, zone } = await employeeContext();
  const copy = messages(await getLocale());
  const events = await prisma.eventHistory.findMany({
    where: {
      OR: [{ userId: user.id }, { zoneId: zone.id }],
    },
    include: { plantCell: true, user: true },
    orderBy: { timestamp: "desc" },
    take: 40,
  });

  return (
    <div>
      <PageHeader title={copy.employee.historyTitle} description={copy.employee.historyLead} />
      {events.length === 0 ? (
        <EmptyState title={copy.employee.noActivity} description={copy.employee.noActivityBody} />
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-3xl border border-sand bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-leaf">
                {event.eventType.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-sm text-muted">
                {formatDateTime(event.timestamp)}
                {event.plantCell ? ` · ${event.plantCell.code}` : ""}
                {event.user ? ` · ${event.user.fullName}` : ""}
              </p>
              <p className="mt-2 text-sm">
                {Object.entries(parseEventDetails(event.details))
                  .filter(([, value]) => typeof value !== "object")
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
