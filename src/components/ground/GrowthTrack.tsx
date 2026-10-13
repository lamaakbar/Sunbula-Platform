import type { GrowthStage } from "@prisma/client";
import { Sprout, Leaf, TreeDeciduous, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const stages: GrowthStage[] = ["SEEDLING", "GROWING", "READY", "DISTRIBUTED"];

export function GrowthTrack({
  stage,
  label,
}: {
  stage: GrowthStage;
  label: (stage: GrowthStage) => string;
}) {
  const current = stages.indexOf(stage);
  const icons = [Sprout, Leaf, TreeDeciduous, Check];
  return (
    <ol className="grid grid-cols-4 gap-2">
      {stages.map((item, index) => {
        const Icon = icons[index];
        const active = index === current;
        const done = index < current;
        return (
          <li key={item} className="min-w-0">
            <div
              className={cn(
                "flex min-h-24 flex-col items-center justify-center rounded-2xl px-2 text-center ring-1",
                active && "bg-forest text-white ring-forest",
                done && "bg-light-sage text-forest ring-sage/40",
                !active && !done && "bg-white text-muted ring-sand",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="mt-2 text-xs font-semibold leading-4">{label(item)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
