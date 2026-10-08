import type { BatchUpdateStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import type { UpdateRow } from "@/components/workflow/UpdateList";

const include = {
  batch: { include: { species: true } },
  submittedBy: true,
  reviewedBy: true,
} satisfies Prisma.BatchUpdateInclude;

export async function listBatchUpdates(where: Prisma.BatchUpdateWhereInput) {
  return prisma.batchUpdate.findMany({
    where,
    include,
    orderBy: { updatedAt: "desc" },
  });
}

export function toUpdateRow(
  item: Awaited<ReturnType<typeof listBatchUpdates>>[number],
  person: string,
): UpdateRow {
  return {
    id: item.id,
    status: item.status,
    code: item.batch.code,
    species: item.batch.species.commonName,
    person,
    previousQuantity: item.previousQuantity,
    proposedQuantity: item.proposedQuantity,
    previousStage: item.previousStage,
    proposedStage: item.proposedStage,
    notes: item.notes,
    feedback: item.feedback,
    reviewer: item.reviewedBy?.fullName ?? null,
    reviewedAt: item.reviewedAt ? formatDateTime(item.reviewedAt) : null,
  };
}

export function countByStatus(rows: Array<{ status: BatchUpdateStatus }>) {
  const counts: Record<string, number> = {
    ALL: rows.length,
    PENDING: 0,
    NEEDS_REVISION: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

export function filterUpdates<
  T extends {
    code: string;
    species: string;
    person: string;
    proposedQuantity: number;
    status: BatchUpdateStatus;
    updatedAt: Date;
  },
>(rows: T[], tab: string, q: string, sort: string) {
  const query = q.trim().toLowerCase();
  const next = rows.filter((row) => (tab === "ALL" ? true : row.status === tab));
  const searched = query
    ? next.filter((row) => `${row.code} ${row.species} ${row.person}`.toLowerCase().includes(query))
    : next;
  return [...searched].sort((a, b) => {
    if (sort === "quantity") return b.proposedQuantity - a.proposedQuantity;
    if (sort === "oldest") return a.updatedAt.getTime() - b.updatedAt.getTime();
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}
