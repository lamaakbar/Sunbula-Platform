import Link from "next/link";
import { notFound } from "next/navigation";
import type { AppUser } from "@/lib/auth/current-user";
import { canAccessZone } from "@/lib/auth/scope";
import { GrowthTrack } from "@/components/ground/GrowthTrack";
import { PlantTag } from "@/components/ground/PlantTag";
import { HealthBadge } from "@/components/data/HealthBadge";
import { PageHeader } from "@/components/ui/Feedback";
import { formatDate, plantAgeLabel } from "@/lib/format";
import { groundCopy } from "@/lib/ground-copy";
import { messages, relativeText } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import { prisma } from "@/lib/prisma";
import { getKnowledge } from "@/lib/domain/knowledge";

export async function PlantFile({
  code,
  user,
  locale,
}: {
  code: string;
  user: AppUser;
  locale: Locale;
}) {
  const copy = messages(locale);
  const ground = groundCopy(locale);
  const batch = await prisma.seedlingBatch.findUnique({
    where: { code },
    include: {
      species: true,
      nursery: true,
      zone: true,
      plantCell: true,
      alerts: {
        where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      operations: { orderBy: { occurredAt: "desc" }, take: 6, include: { user: true } },
      measurements: { orderBy: { timestamp: "desc" }, take: 6 },
      assessments: { orderBy: { assessedAt: "desc" }, take: 5 },
    },
  });
  if (!batch) notFound();

  const sameNursery = user.nurseryId === batch.nurseryId;
  const full =
    user.role === "HQ" ||
    (user.role === "SUPERVISOR" && sameNursery) ||
    (user.role === "EMPLOYEE" &&
      batch.plantCellId != null &&
      canAccessZone(user, batch.zoneId, batch.nurseryId));

  const home = user.role === "HQ" ? "/hq" : user.role === "SUPERVISOR" ? "/supervisor" : "/employee";

  if (!full) {
    return (
      <div>
        <PageHeader eyebrow={ground.summaryOnly} title={batch.species.commonName} description={ground.lockedLead} />
        <section className="grid gap-3 sm:grid-cols-2">
          <Info label={copy.employee.species} value={batch.species.commonName} />
          <Info label={copy.forms.nursery} value={batch.nursery.name} />
          <Info label={copy.forms.zone} value={batch.zone.name} />
          <Info label={copy.employee.stage} value={copy.growth[batch.growthStage]} />
          <Info label={copy.forms.health} value={copy.health[batch.healthStatus]} />
        </section>
        <p className="mt-6 text-sm leading-6 text-muted">{ground.future}</p>
        <Link href={home} className="mt-4 inline-flex text-sm font-semibold text-forest">
          {copy.common.home}
        </Link>
      </div>
    );
  }

  const knowledge = await getKnowledge(batch.speciesId, batch.growthStage);
  const cellHref =
    user.role === "EMPLOYEE" && batch.plantCellId ? `/employee/zone/${batch.plantCellId}` : null;

  return (
    <div>
      <PageHeader
        eyebrow={`${batch.nursery.name} · ${batch.zone.name}${batch.plantCell ? ` · ${batch.plantCell.code}` : ""}`}
        title={ground.file}
        description={ground.tagLead}
      />
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <PlantTag code={batch.code} caption={ground.tagLead} />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-forest">{batch.species.commonName}</h2>
            <HealthBadge status={batch.healthStatus} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {ground.scientific}: {batch.species.scientificName}
          </p>
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-forest">{ground.growthTitle}</h3>
            <GrowthTrack stage={batch.growthStage} label={(stage) => copy.growth[stage]} />
            <p className="mt-3 text-sm leading-6 text-muted">{ground.growthLead}</p>
          </div>
        </div>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info label={copy.employee.batch} value={batch.code} />
        <Info label={copy.employee.quantity} value={String(batch.quantity)} />
        <Info label={ground.source} value={batch.source} />
        <Info label={copy.employee.planting} value={formatDate(batch.plantingDate)} />
        <Info label={copy.employee.age} value={plantAgeLabel(batch.plantingDate)} />
        <Info label={copy.employee.stage} value={copy.growth[batch.growthStage]} />
      </section>

      {knowledge ? (
        <section className="mt-6 rounded-[1.7rem] bg-white p-5 ring-1 ring-sand">
          <h2 className="font-semibold text-forest">{ground.care}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{knowledge.careGuidelines}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{knowledge.irrigationGuidance}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{knowledge.fertilizationGuidance}</p>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <RecordList
          title={copy.employee.recentAlerts}
          empty={copy.employee.noneYet}
          rows={batch.alerts.map((alert) => ({ id: alert.id, title: alert.title, detail: alert.message }))}
        />
        <RecordList
          title={copy.employee.lastOp}
          empty={copy.employee.noneYet}
          rows={batch.operations.map((op) => ({
            id: op.id,
            title: copy.operation[op.type],
            detail: `${op.user.fullName} · ${relativeText(locale, op.occurredAt)}`,
          }))}
        />
        <RecordList
          title={copy.employee.lastReading}
          empty={copy.employee.noneYet}
          rows={batch.measurements.map((reading) => ({
            id: reading.id,
            title: `${copy.metric[reading.metric]} ${reading.value}${reading.unit}`,
            detail: `${copy.quality[reading.qualityStatus]} · ${relativeText(locale, reading.timestamp)}`,
          }))}
        />
        <RecordList
          title={ground.inspectTitle}
          empty={copy.employee.noneYet}
          rows={batch.assessments.map((item) => ({
            id: item.id,
            title: copy.health[item.status],
            detail: item.notes ?? relativeText(locale, item.assessedAt),
          }))}
        />
      </section>
      <p className="mt-6 text-sm leading-6 text-muted">{ground.future}</p>
      {cellHref ? (
        <Link href={cellHref} className="mt-4 inline-flex text-sm font-semibold text-forest">
          {copy.common.details}
        </Link>
      ) : null}
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

function RecordList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{ id: string; title: string; detail: string }>;
}) {
  return (
    <section className="rounded-[1.7rem] bg-white p-5 ring-1 ring-sand">
      <h2 className="font-semibold text-forest">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <p className="text-sm font-semibold text-forest">{row.title}</p>
              <p className="text-sm text-muted">{row.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
