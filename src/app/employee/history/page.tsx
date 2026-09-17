import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/format";
import { parseEventDetails } from "@/services/events";

export default async function HistoryPage() {
  const { user, zone } = await employeeContext();
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
      <PageHeader title="History" description="Your recent actions and zone events." />
      {events.length === 0 ? (
        <EmptyState title="No activity yet" description="Logged operations, readings and completed tasks will show here." />
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
