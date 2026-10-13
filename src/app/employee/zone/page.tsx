import Link from "next/link";
import { getEmployeeHome } from "@/lib/data/employee";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { CellGround } from "@/components/ground/CellGround";
import { Button } from "@/components/ui/Button";
import { groundCopy } from "@/lib/ground-copy";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function MyZonePage() {
  const data = await getEmployeeHome();
  const locale = await getLocale();
  const copy = messages(locale);
  const ground = groundCopy(locale);

  return (
    <div>
      <PageHeader
        eyebrow={data.nurseryName}
        title={data.zoneLabel}
        description={`${copy.employee.zoneLead} ${ground.groundLead}`}
        actions={
          <Link href="/employee/add">
            <Button>{copy.employee.addTitle}</Button>
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={copy.employee.healthy} value={data.summary.healthy} tone="healthy" />
        <StatCard label={copy.employee.needsAttention} value={data.summary.attention} tone="attention" />
        <StatCard label={copy.employee.critical} value={data.summary.critical} tone="critical" />
        <StatCard label={copy.employee.noData} value={data.summary.noData} />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label={copy.employee.avgMoisture}
          value={data.avgMoisture == null ? "—" : `${data.avgMoisture}%`}
          tone="water"
        />
        <StatCard label={copy.employee.opsToday} value={data.operationsToday} />
        <StatCard label={copy.employee.openAlerts} value={data.alerts} tone={data.alerts ? "attention" : "default"} />
      </section>

      <div className="mt-8 space-y-8">
        {data.zones.map((zone) => (
          <section key={zone.id}>
            {data.zones.length > 1 ? <h2 className="mb-3 text-lg font-semibold text-forest">{zone.name}</h2> : null}
            <CellGround
              cells={data.cells.filter((cell) => cell.zoneId === zone.id)}
              hrefFor={(cell) => `/employee/zone/${cell.id}`}
              emptyLabel={ground.emptyCell}
              stageLabel={(stage) => copy.growth[stage]}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
