import Link from "next/link";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{eyebrow}</p>
        ) : null}
        <h1 className="text-[clamp(1.85rem,3.2vw,2.5rem)] font-semibold leading-tight tracking-tight text-forest">
          {title}
        </h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: Array<{ href?: string; label: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden className="text-sage">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-sage bg-white/80 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-light-sage text-forest">
        <Sprout className="h-7 w-7" />
      </div>
      <p className="text-lg font-semibold text-forest">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[2rem] border border-critical/30 bg-critical/5 px-6 py-8 text-center">
      <p className="font-semibold text-critical">{title}</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "water" | "attention" | "critical" | "healthy";
  icon?: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] p-5 ring-1",
        tone === "default" && "bg-white ring-sand",
        tone === "water" && "bg-water/8 ring-water/20",
        tone === "attention" && "bg-attention/8 ring-attention/25",
        tone === "critical" && "bg-critical/8 ring-critical/20",
        tone === "healthy" && "bg-healthy/8 ring-healthy/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {icon ? <span className="text-leaf">{icon}</span> : null}
      </div>
      <p className="mt-3 text-[1.85rem] font-semibold tracking-tight text-forest">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}
