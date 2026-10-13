import Link from "next/link";
import { openPlantCodeAction } from "@/app/actions/inspections";
import { InspectionForm } from "@/components/ground/InspectionForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { Button, fieldClass } from "@/components/ui/Button";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { employeeContext } from "@/lib/data/employee";
import { getZoneCells } from "@/lib/data/cells";
import { weeklyInspections } from "@/lib/data/inspections";
import { groundCopy } from "@/lib/ground-copy";
import { inspectionDay, inspectionSample } from "@/lib/inspection";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function InspectPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const ctx = await employeeContext();
  const locale = await getLocale();
  const copy = messages(locale);
  const ground = groundCopy(locale);
  const { saved } = await searchParams;
  const grouped = await Promise.all(ctx.zoneIds.map((zoneId) => getZoneCells(zoneId)));
  const cells = grouped.flat();
  const sample = inspectionSample(cells, inspectionDay());
  const flagged = cells.filter(
    (cell) => cell.hasOpenAlert || cell.health === "ATTENTION" || cell.health === "CRITICAL",
  );
  const week = await weeklyInspections(ctx.nurseryId);

  return (
    <div>
      <SavedToast value={saved} />
      <PageHeader eyebrow={ctx.nurseryName} title={ground.inspectTitle} description={ground.inspectLead} />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label={ground.week} value={week.checked} />
        <StatCard label={ground.weekFollow} value={week.followUp} tone={week.followUp ? "attention" : "default"} />
        <StatCard label={copy.supervisor.zonesTitle} value={week.zones} />
      </section>

      <form action={openPlantCodeAction} className="mt-6 flex flex-wrap items-end gap-2">
        <label className="min-w-48 flex-1 text-sm font-semibold text-forest">
          {ground.lookup}
          <input name="code" placeholder={ground.code} className={`${fieldClass} mt-1`} />
        </label>
        <Button type="submit">{ground.open}</Button>
      </form>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-forest">{copy.employee.needsAttention}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {flagged.map((cell) => (
            <Link key={cell.id} href={`/employee/zone/${cell.id}`} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-sand">
              <p className="font-semibold text-forest">{cell.code}</p>
              <p className="text-sm text-muted">{cell.speciesName}</p>
            </Link>
          ))}
          {flagged.length === 0 ? <p className="text-sm text-muted">{copy.employee.noneYet}</p> : null}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-forest">{ground.sample}</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {sample.map((cell) => (
            <div key={cell.id}>
              <Link href={`/employee/zone/${cell.id}`} className="mb-2 block text-sm font-semibold text-forest">
                {cell.code} · {cell.speciesName}
              </Link>
              <InspectionForm
                cellId={cell.id}
                returnTo="/employee/inspect"
                copy={ground}
                statusLabels={{
                  status: copy.forms.health,
                  healthy: copy.health.HEALTHY,
                  attention: copy.health.ATTENTION,
                  critical: copy.health.CRITICAL,
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
