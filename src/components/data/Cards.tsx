import Link from "next/link";
import type { HealthStatus } from "@prisma/client";
import { HealthBadge } from "@/components/data/HealthBadge";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { healthTone } from "@/lib/domain/health";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { cn } from "@/lib/cn";

export function PlantCellCard({
  href,
  code,
  health,
  speciesName,
}: {
  href: string;
  code: string;
  health: HealthStatus;
  speciesName: string;
}) {
  const tone = healthTone(health);
  return (
    <Link
      href={href}
      className={cn(
        "card-lift relative block overflow-hidden rounded-[1.6rem] p-4 ring-1",
        health === "HEALTHY" && "bg-white ring-healthy/20",
        health === "ATTENTION" && "bg-attention/6 ring-attention/30",
        health === "CRITICAL" && "bg-critical/6 ring-critical/25",
        health === "NO_RECENT_DATA" && "bg-white ring-sand",
      )}
    >
      <BotanicalMark className="pointer-events-none absolute -bottom-6 -right-5 h-20 w-20 text-sage/25" variant="seed" />
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-lg font-semibold tracking-tight text-forest">{code}</p>
        <span className={cn("mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-white", tone.dot)} aria-hidden />
      </div>
      <p className="relative mt-1 text-sm text-muted">{speciesName}</p>
      <div className="relative mt-4">
        <HealthBadge status={health} size="sm" />
      </div>
    </Link>
  );
}

export function ZoneCard({
  href,
  name,
  score,
  health,
  hint,
}: {
  href: string;
  name: string;
  score: number;
  health: HealthStatus;
  hint?: string;
}) {
  const tone = healthTone(health);
  return (
    <Link href={href} className="card-lift relative block overflow-hidden rounded-[1.7rem] bg-white p-5 ring-1 ring-sand">
      <BotanicalMark className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 text-sage/20" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-forest">{name}</p>
          {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
        </div>
        <p className="text-2xl font-semibold text-leaf">{score}%</p>
      </div>
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-sand/80">
        <div className={cn("h-full rounded-full", tone.dot)} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      <div className="relative mt-4">
        <HealthBadge status={health} />
      </div>
    </Link>
  );
}

export async function NurseryCard({
  href,
  name,
  health,
  production,
  readyStock,
  alerts,
}: {
  href: string;
  name: string;
  health: HealthStatus;
  production: string;
  readyStock: string;
  alerts: number;
}) {
  const copy = messages(await getLocale());
  return (
    <article className="card-lift relative overflow-hidden rounded-[1.8rem] bg-white p-6 ring-1 ring-sand">
      <BotanicalMark className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 text-sage/20" variant="canopy" />
      <div className="relative flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-forest">{name}</h2>
        <HealthBadge status={health} size="sm" />
      </div>
      <dl className="relative mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-cream/80 px-3 py-3">
          <dt className="text-muted">{copy.hq.production}</dt>
          <dd className="mt-1 font-semibold text-ink">{production}</dd>
        </div>
        <div className="rounded-2xl bg-cream/80 px-3 py-3">
          <dt className="text-muted">{copy.hq.readyStock}</dt>
          <dd className="mt-1 font-semibold text-ink">{readyStock}</dd>
        </div>
        <div className="rounded-2xl bg-cream/80 px-3 py-3">
          <dt className="text-muted">{copy.supervisor.alertsTitle}</dt>
          <dd className="mt-1 font-semibold text-ink">{alerts}</dd>
        </div>
      </dl>
      <Link href={href} className="relative mt-5 inline-flex min-h-11 items-center rounded-2xl bg-light-sage px-4 text-sm font-semibold text-forest">
        {copy.hq.openNursery}
      </Link>
    </article>
  );
}
