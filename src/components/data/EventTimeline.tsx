import type { EventType } from "@prisma/client";
import { formatDateTime } from "@/lib/format";
import { messages } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import { parseEventDetails } from "@/services/events";

export function EventTimeline({
  locale,
  events,
}: {
  locale: Locale;
  events: Array<{
    id: string;
    eventType: EventType;
    timestamp: Date;
    details: string;
    plantCell?: { code: string } | null;
    user?: { fullName: string } | null;
  }>;
}) {
  const copy = messages(locale);
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-3xl border border-sand bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-leaf">
            {copy.event[event.eventType]}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatDateTime(event.timestamp)}
            {event.plantCell ? ` · ${event.plantCell.code}` : ""}
            {event.user ? ` · ${event.user.fullName}` : ""}
          </p>
          <p className="mt-2 text-sm">
            {Object.entries(parseEventDetails(event.details))
              .filter(([, value]) => typeof value !== "object" && value !== null && value !== "")
              .map(([key, value]) => `${key}: ${String(value)}`)
              .join(" · ")}
          </p>
        </li>
      ))}
    </ol>
  );
}
