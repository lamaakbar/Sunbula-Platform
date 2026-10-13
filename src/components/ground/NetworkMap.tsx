import Link from "next/link";
import type { HealthStatus } from "@prisma/client";
import { healthTone } from "@/lib/domain/health";
import { cn } from "@/lib/cn";

export type NetworkSite = {
  id: string;
  name: string;
  href: string;
  health: HealthStatus;
  detail: string;
  locked: boolean;
};

export function NetworkMap({
  hqLabel,
  enterLabel,
  summaryLabel,
  sites,
}: {
  hqLabel: string;
  enterLabel: string;
  summaryLabel: string;
  sites: NetworkSite[];
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-3xl">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
        {sites.map((site, index) => {
          const point = place(index, sites.length);
          return (
            <line
              key={site.id}
              x1="50"
              y1="50"
              x2={point.x}
              y2={point.y}
              stroke="currentColor"
              className="text-sage/70"
              strokeWidth="0.35"
            />
          );
        })}
      </svg>
      <div
        className="absolute z-10 w-28"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="flex aspect-square items-center justify-center rounded-[1.6rem] bg-forest text-center text-sm font-semibold text-white shadow-[0_16px_40px_-18px_rgba(14,45,30,0.8)]">
          {hqLabel}
        </div>
      </div>
      {sites.map((site, index) => {
        const point = place(index, sites.length);
        const tone = healthTone(site.health);
        return (
          <Link
            key={site.id}
            href={site.href}
            className="absolute z-10 w-36 rounded-2xl bg-white p-3 text-start ring-1 ring-sand shadow-sm transition hover:ring-sage"
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className={cn("mb-2 inline-flex h-2.5 w-2.5 rounded-full", tone.dot)} aria-hidden />
            <p className="text-sm font-semibold leading-5 text-forest">{site.name}</p>
            <p className="mt-1 text-xs text-muted">{site.detail}</p>
            <p className="mt-2 text-xs font-semibold text-leaf">{site.locked ? summaryLabel : enterLabel}</p>
          </Link>
        );
      })}
    </div>
  );
}

function place(index: number, count: number) {
  const angle = (index / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * 36,
    y: 50 + Math.sin(angle) * 36,
  };
}
