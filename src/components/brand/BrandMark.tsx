import { Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

export function BrandMark({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm",
          light ? "bg-white/12 text-cream ring-1 ring-white/15" : "bg-forest text-cream",
        )}
      >
        <Sprout className="h-6 w-6" aria-hidden />
      </div>
      {compact ? null : (
        <div>
          <p className={cn("text-lg font-semibold tracking-tight", light ? "text-white" : "text-forest")}>
            SANBALA
          </p>
          <p className={cn("font-arabic text-sm leading-none", light ? "text-sage" : "text-leaf")}>سنبلة</p>
        </div>
      )}
    </div>
  );
}
