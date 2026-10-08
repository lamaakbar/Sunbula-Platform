import Link from "next/link";
import { AlertTriangle, Clock, Droplets } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { formatDateTime } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { cn } from "@/lib/cn";

export async function TaskCard({
  title,
  description,
  zone,
  cell,
  species,
  dueAt,
  status,
  priority,
  href,
  action,
}: {
  title: string;
  description: string;
  zone?: string | null;
  cell?: string | null;
  species?: string | null;
  dueAt?: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  href?: string;
  action?: React.ReactNode;
}) {
  const copy = messages(await getLocale());
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] bg-white p-5 ring-1",
        priority === "URGENT" ? "ring-critical/35" : "ring-sand",
        status === "COMPLETED" && "opacity-90",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 start-0 w-1.5",
          priority === "URGENT" ? "bg-critical" : priority === "HIGH" ? "bg-attention" : "bg-leaf/70",
        )}
      />
      <div className="flex flex-wrap items-center gap-2 ps-2">
        {priority === "URGENT" ? (
          <span className="rounded-full bg-critical/10 px-2.5 py-1 text-xs font-semibold text-critical">{copy.priority.URGENT}</span>
        ) : (
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-forest">{copy.priority[priority]}</span>
        )}
        <span className="rounded-full bg-light-sage px-2.5 py-1 text-xs font-semibold text-leaf">
          {copy.task[status]}
        </span>
      </div>
      <h3 className="mt-3 flex items-center gap-2 ps-2 text-lg font-semibold text-forest">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-water/10 text-water">
          <Droplets className="h-5 w-5" />
        </span>
        {title}
      </h3>
      <p className="mt-2 ps-2 text-sm leading-6 text-muted">{description}</p>
      <dl className="mt-4 grid gap-1 ps-2 text-sm">
        {zone ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{copy.forms.zone}</dt>
            <dd className="font-medium">{zone}</dd>
          </div>
        ) : null}
        {cell ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{copy.forms.cell}</dt>
            <dd className="font-medium">{cell}</dd>
          </div>
        ) : null}
        {species ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{copy.forms.species}</dt>
            <dd className="font-medium">{species}</dd>
          </div>
        ) : null}
        {dueAt ? (
          <div className="flex justify-between gap-3">
            <dt className="flex items-center gap-1 text-muted">
              <Clock className="h-4 w-4" /> Required
            </dt>
            <dd className="font-medium">{formatDateTime(dueAt)}</dd>
          </div>
        ) : null}
      </dl>
      {action ? <div className="mt-4 ps-2">{action}</div> : null}
      {href ? (
        <Link href={href} className="mt-4 inline-flex min-h-11 items-center ps-2 font-semibold text-forest">
          {copy.common.details}
        </Link>
      ) : null}
    </article>
  );
}

export async function AlertCard({
  title,
  message,
  href,
}: {
  title: string;
  message: string;
  href?: string;
}) {
  const copy = messages(await getLocale());
  return (
    <article className="relative overflow-hidden rounded-[1.7rem] bg-white p-5 ring-1 ring-attention/30">
      <span className="absolute inset-y-0 start-0 w-1.5 bg-attention" />
      <p className="flex items-center gap-2 ps-2 font-semibold text-forest">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-attention/15 text-attention">
          <AlertTriangle className="h-5 w-5" />
        </span>
        {title}
      </p>
      <p className="mt-3 ps-2 text-sm leading-6 text-muted">{message}</p>
      {href ? (
        <Link href={href} className="mt-4 inline-flex min-h-11 items-center ps-2 text-sm font-semibold text-forest">
          {copy.common.review}
        </Link>
      ) : null}
    </article>
  );
}

export async function ReadingCard({
  label,
  value,
  unit,
  meaning,
  expected,
  source,
  quality,
  updated,
  href,
}: {
  label: string;
  value: string;
  unit: string;
  meaning: string;
  expected?: string;
  source: string;
  quality?: string;
  updated: string;
  href?: string;
}) {
  const copy = messages(await getLocale());
  const tone =
    meaning === "LOW" || meaning === "HIGH"
      ? "attention"
      : meaning === "NORMAL"
        ? "healthy"
        : "muted";

  return (
    <article className="overflow-hidden rounded-[1.8rem] bg-white p-6 ring-1 ring-sand">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-water">{label}</p>
      <p className="mt-3 text-5xl font-semibold tracking-tight text-forest">
        {value}
        <span className="ms-1 text-lg font-medium text-muted">{unit}</span>
      </p>
      <p
        className={cn(
          "mt-3 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold",
          tone === "attention" && "bg-attention/15 text-attention",
          tone === "healthy" && "bg-healthy/15 text-healthy",
          tone === "muted" && "bg-sand text-muted",
        )}
      >
        {meaning}
      </p>
      {quality ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{quality}</p>
      ) : null}
      {expected ? <p className="mt-2 text-sm text-muted">{copy.employee.expected}: {expected}</p> : null}
      <p className="mt-4 text-xs text-muted">
        {source} · {updated}
      </p>
      {href ? (
        <Link href={href} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-forest">
          {copy.common.review}
        </Link>
      ) : null}
    </article>
  );
}
