import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, EmptyState, PageHeader } from "@/components/ui/Feedback";
import { formatDateTime } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { parseEventDetails } from "@/services/events";

export default async function CellHistoryPage({ params }: { params: Promise<{ cellId: string }> }) {
  const user = await requireRole("EMPLOYEE");
  const copy = messages(await getLocale());
  const { cellId } = await params;
  const cell = await getAccessibleCell(user, cellId);
  const events = await prisma.eventHistory.findMany({
    where: { plantCellId: cell.id },
    include: { user: true },
    orderBy: { timestamp: "desc" },
    take: 40,
  });

  return (
    <div>
      <Breadcrumbs items={[{ href: `/employee/zone/${cell.id}`, label: cell.code }, { label: copy.employee.historyTitle }]} />
      <PageHeader title={`${copy.employee.historyTitle} · ${cell.code}`} description={copy.employee.cellHistory} />
      {events.length === 0 ? (
        <EmptyState title={copy.employee.noHistory} description={copy.employee.noHistoryBody} />
      ) : (
        <ol className="space-y-3">
          {events.map((event) => {
            const details = parseEventDetails(event.details);
            return (
              <li key={event.id} className="rounded-3xl border border-sand bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-leaf">
                  {event.eventType.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {formatDateTime(event.timestamp)}
                  {event.user ? ` · ${event.user.fullName}` : ""}
                </p>
                <p className="mt-2 text-sm text-ink">{summarize(details)}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function summarize(details: Record<string, unknown>) {
  return Object.entries(details)
    .filter(([, value]) => value != null && typeof value !== "object")
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}
