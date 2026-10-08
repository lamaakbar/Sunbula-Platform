import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EventTimeline } from "@/components/data/EventTimeline";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function HistoryPage() {
  const { user, zoneIds } = await employeeContext();
  const locale = await getLocale();
  const copy = messages(locale);
  const events = await prisma.eventHistory.findMany({
    where: {
      OR: [{ userId: user.id }, { zoneId: { in: zoneIds } }],
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
        <EventTimeline locale={locale} events={events} />
      )}
    </div>
  );
}
