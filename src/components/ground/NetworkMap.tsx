import Link from "next/link";
import type { HealthStatus } from "@prisma/client";
import { ArrowUpRight, Lock } from "lucide-react";
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

const stroke: Record<HealthStatus, string> = {
  HEALTHY: "var(--healthy)",
  ATTENTION: "var(--attention)",
  CRITICAL: "var(--critical)",
  NO_RECENT_DATA: "var(--sage)",
};

const orbitSlot = [
  "col-start-2 row-start-1",
  "col-start-3 row-start-2",
  "col-start-3 row-start-3",
  "col-start-1 row-start-3",
  "col-start-1 row-start-2",
];

const orbitPoint = [
  { x: 50, y: 16 },
  { x: 84, y: 50 },
  { x: 84, y: 84 },
  { x: 16, y: 84 },
  { x: 16, y: 50 },
];

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
  const aroundHq = sites.length === 5;

  return (
    <div>
      {aroundHq ? (
        <div className="relative hidden overflow-hidden rounded-[1.75rem] bg-cream ring-1 ring-sand md:block">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--light-sage)_0%,transparent_70%)]"
            aria-hidden
          />
          <div className="relative p-4 lg:p-5">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sage/50"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-leaf/35"
              aria-hidden
            />
            <svg
              className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] lg:inset-5 lg:h-[calc(100%-2.5rem)] lg:w-[calc(100%-2.5rem)]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {sites.map((site, index) => (
                <line
                  key={site.id}
                  x1="50"
                  y1="50"
                  x2={orbitPoint[index].x}
                  y2={orbitPoint[index].y}
                  stroke={stroke[site.health]}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.7"
                />
              ))}
            </svg>
            <div className="relative grid grid-cols-3 items-stretch gap-3">
              {sites.map((site, index) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  enterLabel={enterLabel}
                  summaryLabel={summaryLabel}
                  className={orbitSlot[index]}
                />
              ))}
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <span className="absolute inset-0 rounded-[1.7rem] bg-leaf/15 motion-safe:animate-pulse" aria-hidden />
                  <div className="relative flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-[1.4rem] bg-forest px-2 text-center text-white shadow-lift">
                    <span className="text-[10px] font-medium tracking-[0.16em] text-sage">SUNBULLA</span>
                    <span className="mt-1 text-sm font-semibold leading-4">{hqLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={aroundHq ? "md:hidden" : undefined}>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-forest px-3 py-2 text-white shadow-card">
            <span className="text-[9px] font-medium tracking-[0.12em] text-sage">SUNBULLA</span>
            <span className="text-sm font-semibold leading-5">{hqLabel}</span>
          </div>
          <div className="h-px flex-1 bg-sage" />
        </div>
        <ul className="space-y-2">
          {sites.map((site) => (
            <li key={site.id}>
              <SiteCard site={site} enterLabel={enterLabel} summaryLabel={summaryLabel} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SiteCard({
  site,
  enterLabel,
  summaryLabel,
  className,
}: {
  site: NetworkSite;
  enterLabel: string;
  summaryLabel: string;
  className?: string;
}) {
  const tone = healthTone(site.health);
  const action = site.locked ? summaryLabel : enterLabel;
  return (
    <Link
      href={site.href}
      aria-label={`${site.name}. ${site.detail}. ${action}`}
      title={site.name}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl bg-white p-3 text-start shadow-card ring-1 ring-sand transition hover:shadow-lift hover:ring-leaf focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf",
        className,
      )}
    >
      <span className={cn("absolute inset-y-3 start-0 w-1 rounded-full", tone.dot)} aria-hidden />
      <span className="flex items-start gap-2 ps-2">
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-5 text-forest">{site.name}</span>
          <span className="mt-1 block text-xs leading-5 text-muted">{site.detail}</span>
        </span>
      </span>
      <span className="mt-3 flex items-center justify-between gap-2 border-t border-sand/80 ps-2 pt-2 text-[11px] font-semibold text-forest">
        <span className="inline-flex min-w-0 items-center gap-1">
          {site.locked ? <Lock className="h-3 w-3 shrink-0" aria-hidden /> : null}
          <span className="truncate">{action}</span>
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-leaf transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:-scale-x-100" aria-hidden />
      </span>
    </Link>
  );
}
