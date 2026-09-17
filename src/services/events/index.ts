import type { PrismaClient } from "@prisma/client";
import type { EventType } from "@prisma/client";

type EventInput = {
  eventType: EventType;
  userId?: string | null;
  nurseryId?: string | null;
  zoneId?: string | null;
  plantCellId?: string | null;
  batchId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  details: Record<string, unknown>;
  timestamp?: Date;
};

type Db = {
  eventHistory: PrismaClient["eventHistory"];
};

export async function recordEvent(db: Db, input: EventInput) {
  return db.eventHistory.create({
    data: {
      eventType: input.eventType,
      timestamp: input.timestamp ?? new Date(),
      userId: input.userId ?? undefined,
      nurseryId: input.nurseryId ?? undefined,
      zoneId: input.zoneId ?? undefined,
      plantCellId: input.plantCellId ?? undefined,
      batchId: input.batchId ?? undefined,
      relatedEntityType: input.relatedEntityType ?? undefined,
      relatedEntityId: input.relatedEntityId ?? undefined,
      details: JSON.stringify(input.details),
    },
  });
}

export function parseEventDetails(raw: string) {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { text: raw };
  }
}
