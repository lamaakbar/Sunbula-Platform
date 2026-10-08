import Link from "next/link";
import type { BatchUpdateStatus, GrowthStage } from "@prisma/client";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { cn } from "@/lib/cn";
import type { workflowCopy } from "@/lib/workflow-copy";

type Copy = ReturnType<typeof workflowCopy>;

export type UpdateRow = {
  id: string;
  status: BatchUpdateStatus;
  code: string;
  species: string;
  person: string;
  previousQuantity: number;
  proposedQuantity: number;
  previousStage: GrowthStage;
  proposedStage: GrowthStage;
  notes: string;
  feedback: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
};

const tone: Record<BatchUpdateStatus, string> = {
  PENDING: "bg-sand text-forest",
  NEEDS_REVISION: "bg-attention/15 text-attention",
  APPROVED: "bg-healthy/15 text-healthy",
  REJECTED: "bg-critical/10 text-critical",
};

export function StatusTabs({
  base,
  tab,
  counts,
  copy,
}: {
  base: string;
  tab: string;
  counts: Record<string, number>;
  copy: Copy;
}) {
  const tabs = [
    ["PENDING", copy.pending],
    ["NEEDS_REVISION", copy.revision],
    ["APPROVED", copy.approved],
    ["REJECTED", copy.rejected],
    ["ALL", copy.all],
  ] as const;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
      {tabs.map(([key, label]) => {
        const active = tab === key;
        return (
          <Link
            key={key}
            role="tab"
            aria-selected={active}
            href={`${base}?tab=${key}`}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
              active ? "bg-forest text-white" : "bg-white text-forest ring-1 ring-sand hover:bg-light-sage",
            )}
          >
            {label}
            <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/15" : "bg-cream")}>{counts[key] ?? 0}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function UpdateSearch({
  base,
  tab,
  q,
  sort,
  copy,
}: {
  base: string;
  tab: string;
  q: string;
  sort: string;
  copy: Copy;
}) {
  return (
    <form action={base} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="tab" value={tab} />
      <input
        name="q"
        defaultValue={q}
        placeholder={copy.search}
        className="min-h-11 flex-1 rounded-2xl border border-sand bg-white px-4 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-sage/50"
      />
      <select
        name="sort"
        defaultValue={sort}
        className="min-h-11 rounded-2xl border border-sand bg-white px-3 text-sm outline-none focus:border-leaf focus:ring-2 focus:ring-sage/50"
      >
        <option value="newest">{copy.sortNewest}</option>
        <option value="oldest">{copy.sortOldest}</option>
        <option value="quantity">{copy.sortQty}</option>
      </select>
      <button type="submit" className="min-h-11 rounded-2xl bg-light-sage px-4 text-sm font-semibold text-forest">
        {copy.search.split(" ")[0]}
      </button>
    </form>
  );
}

export async function UpdateRows({
  rows,
  base,
  tab,
  q,
  sort,
  selectedId,
  statusLabel,
}: {
  rows: UpdateRow[];
  base: string;
  tab: string;
  q: string;
  sort: string;
  selectedId?: string;
  statusLabel: (status: BatchUpdateStatus) => string;
}) {
  const ui = messages(await getLocale());
  return (
    <ul className="mt-4 space-y-3">
      {rows.map((row) => {
        const params = new URLSearchParams({ tab, id: row.id });
        if (q) params.set("q", q);
        if (sort && sort !== "newest") params.set("sort", sort);
        const active = row.id === selectedId;
        return (
          <li key={row.id}>
            <Link
              href={`${base}?${params.toString()}`}
              aria-current={active ? "true" : undefined}
              className={cn(
                "block rounded-[1.5rem] bg-white p-4 ring-1 transition hover:-translate-y-0.5",
                active ? "ring-forest" : "ring-sand hover:ring-sage",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-forest">
                  {row.code} · {row.species}
                </p>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone[row.status])}>{statusLabel(row.status)}</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {row.previousQuantity} → {row.proposedQuantity} · {ui.growth[row.previousStage]} → {ui.growth[row.proposedStage]}
              </p>
              <p className="mt-1 text-xs text-muted">{row.person}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
