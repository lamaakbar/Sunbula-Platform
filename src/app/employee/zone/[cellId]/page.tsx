import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, ClipboardList, Droplets, History, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { getCellDetail } from "@/lib/data/cells";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { HealthBadge } from "@/components/data/HealthBadge";
import { ReadingCard } from "@/components/data/OpsCards";
import { SavedToast } from "@/components/feedback/SavedToast";
import { formatDate, plantAgeLabel } from "@/lib/format";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { readingMeaning } from "@/services/data-quality";
import { rangeForMetric, recommendationFor } from "@/services/recommendations";

export default async function CellDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ cellId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const locale = await getLocale();
  const copy = messages(locale);
  const { cellId } = await params;
  const { saved } = await searchParams;
  await getAccessibleCell(user, cellId);
  const detail = await getCellDetail(cellId);
  if (!detail) notFound();

  const { cell, batch, knowledge, latestByMetric, health } = detail;
  const moisture = latestByMetric.get("SOIL_MOISTURE");
  const range = knowledge ? rangeForMetric(knowledge, "SOIL_MOISTURE") : null;
  const meaning = moisture ? readingMeaning(moisture.value, range) : "UNKNOWN";
  const rec = moisture ? recommendationFor("SOIL_MOISTURE", meaning, knowledge) : null;

  return (
    <div>
      <SavedToast value={saved} />
      <Breadcrumbs
        items={[
          { href: "/employee", label: copy.common.home },
          { href: "/employee/zone", label: cell.zone.name },
          { label: cell.code },
        ]}
      />
      <PageHeader
        eyebrow={`${cell.nursery.name} · ${cell.zone.name}`}
        title={`${copy.forms.cell} ${cell.code}`}
        description={batch ? `${batch.species.commonName} · ${batch.code}` : copy.employee.noneYet}
      />

      <div className="flex flex-wrap items-center gap-3">
        <HealthBadge status={health} />
        {batch ? <span className="text-sm text-muted">{copy.growth[batch.growthStage]}</span> : null}
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info label={copy.employee.species} value={batch?.species.commonName ?? "—"} />
        <Info label={copy.employee.batch} value={batch?.code ?? "—"} />
        <Info label={copy.employee.quantity} value={batch ? String(batch.quantity) : "—"} />
        <Info label={copy.employee.age} value={batch ? plantAgeLabel(batch.plantingDate) : "—"} />
        <Info label={copy.employee.planting} value={batch ? formatDate(batch.plantingDate) : "—"} />
        <Info label={copy.employee.stage} value={batch ? copy.growth[batch.growthStage] : "—"} />
        <Info label={copy.employee.lastReading} value={moisture ? `${moisture.value}${moisture.unit}` : copy.employee.noneYet} />
        <Info label={copy.employee.lastOp} value={cell.operations[0] ? `${copy.operation[cell.operations[0].type]} · ${relativeText(locale, cell.operations[0].occurredAt)}` : copy.employee.noneYet} />
      </section>

      {moisture ? (
        <div className="mt-6 max-w-md">
          <ReadingCard
            label={copy.metric.SOIL_MOISTURE}
            value={String(moisture.value)}
            unit={moisture.unit}
            meaning={meaning}
            expected={range ? `${range.min}–${range.max}%` : undefined}
            source={`${copy.source[moisture.source]}${moisture.recordedBy ? ` · ${moisture.recordedBy.fullName}` : ""}`}
            quality={copy.quality[moisture.qualityStatus]}
            updated={relativeText(locale, moisture.timestamp)}
          />
          {rec && meaning !== "NORMAL" ? (
            <p className="mt-3 rounded-[1.3rem] bg-light-sage px-4 py-3 text-sm leading-6 text-forest">
              <span className="font-semibold">{rec.title}.</span> {rec.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {cell.alerts.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold text-forest">{copy.employee.recentAlerts}</h2>
          {cell.alerts.map((alert) => (
            <article key={alert.id} className="rounded-[1.5rem] bg-white p-4 ring-1 ring-attention/30">
              <p className="font-semibold text-forest">{alert.title}</p>
              <p className="mt-1 text-sm text-muted">{alert.message}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <ActionLink href={`/employee/zone/${cell.id}/operate`} icon={Droplets} label={copy.employee.logOp} primary />
        <ActionLink href={`/employee/zone/${cell.id}/reading`} icon={Plus} label={copy.employee.addReading} />
        <ActionLink href={`/employee/zone/${cell.id}/image`} icon={Camera} label={copy.employee.upload} />
        <ActionLink href={`/employee/zone/${cell.id}/history`} icon={History} label={copy.employee.historyTitle} />
        {cell.tasks[0] ? (
          <ActionLink href={`/employee/tasks`} icon={ClipboardList} label={copy.employee.tasksTitle} />
        ) : null}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] bg-white p-4 ring-1 ring-sand">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1.5 font-semibold text-ink">{value}</p>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
  primary = false,
}: {
  href: string;
  icon: typeof Droplets;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "flex min-h-16 items-center gap-3 rounded-[1.5rem] bg-forest px-5 text-lg font-semibold text-white shadow-[0_12px_24px_-16px_rgba(14,45,30,0.8)] transition hover:bg-deep"
          : "flex min-h-16 items-center gap-3 rounded-[1.5rem] bg-white px-5 text-lg font-semibold text-forest ring-1 ring-sand transition hover:bg-light-sage"
      }
    >
      <span className={primary ? "flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sage" : "flex h-10 w-10 items-center justify-center rounded-xl bg-light-sage text-forest"}>
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </Link>
  );
}
