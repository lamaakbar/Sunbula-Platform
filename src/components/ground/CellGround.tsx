import Link from "next/link";
import type { GrowthStage, HealthStatus } from "@prisma/client";
import { healthTone } from "@/lib/domain/health";
import { cn } from "@/lib/cn";

export type GroundCell = {
  id: string;
  code: string;
  row: number;
  col: number;
  health: HealthStatus;
  stage: GrowthStage | null;
  speciesName: string;
  batchCode: string | null;
};

export function CellGround({
  cells,
  hrefFor,
  emptyLabel,
  stageLabel,
}: {
  cells: GroundCell[];
  hrefFor: (cell: GroundCell) => string | null;
  emptyLabel: string;
  stageLabel: (stage: GrowthStage) => string;
}) {
  const rows = Math.max(1, ...cells.map((cell) => cell.row + 1));
  const cols = Math.max(1, ...cells.map((cell) => cell.col + 1));
  const byPlace = new Map(cells.map((cell) => [`${cell.row}:${cell.col}`, cell]));

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * cols }, (_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const cell = byPlace.get(`${row}:${col}`);
        if (!cell) {
          return <div key={`${row}-${col}`} className="min-h-24 rounded-2xl bg-cream/50 ring-1 ring-sand/70" />;
        }
        const tone = healthTone(cell.health);
        const href = hrefFor(cell);
        const body = (
          <>
            <p className="text-sm font-semibold text-forest">{cell.code}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted">{cell.batchCode ? cell.speciesName : emptyLabel}</p>
            {cell.stage ? <p className="mt-2 text-[11px] font-semibold text-leaf">{stageLabel(cell.stage)}</p> : null}
          </>
        );
        const className = cn("flex min-h-24 flex-col rounded-2xl border p-3 text-start", tone.bg, tone.border);
        return href ? (
          <Link key={cell.id} href={href} className={cn(className, "transition hover:-translate-y-0.5")}>
            {body}
          </Link>
        ) : (
          <div key={cell.id} className={className}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
