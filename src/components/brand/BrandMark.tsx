import { Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

export function BrandMark({
  tone = "dark",
  size = "md",
}: {
  compact?: boolean;
  light?: boolean;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center", size === "hero" ? "gap-3.5" : "gap-2.5")}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          light ? "bg-white/15 text-sage ring-1 ring-white/20" : "bg-light-sage text-leaf ring-1 ring-sage/40",
          size === "hero" && "h-14 w-14",
          size === "lg" && "h-10 w-10",
          size === "md" && "h-9 w-9",
          size === "sm" && "h-8 w-8",
        )}
      >
        <Sprout className={size === "hero" ? "h-7 w-7" : "h-5 w-5"} aria-hidden />
      </span>
      <span
        className={cn(
          "font-semibold uppercase leading-none",
          light ? "text-white" : "text-forest",
          size === "hero" && "text-[clamp(2.1rem,5vw,3.6rem)] tracking-[0.14em]",
          size === "lg" && "text-2xl tracking-[0.16em]",
          size === "md" && "text-[1.15rem] tracking-[0.18em]",
          size === "sm" && "text-lg tracking-[0.16em]",
        )}
      >
        {light ? (
          "SUNBULLA"
        ) : (
          <>
            SUN<span className="text-leaf">BULLA</span>
          </>
        )}
      </span>
    </span>
  );
}
