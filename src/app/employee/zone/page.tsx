import Link from "next/link";
import { getEmployeeHome } from "@/lib/data/employee";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { PlantCellCard } from "@/components/data/Cards";
import { Button } from "@/components/ui/Button";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function MyZonePage() {
  const data = await getEmployeeHome();
  const copy = messages(await getLocale());

  return (
    <div>
      <PageHeader
        eyebrow={data.nurseryName}
        title={data.zone.name}
        description={copy.employee.zoneLead}
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

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {data.cells.map((cell) => (
          <PlantCellCard
            key={cell.id}
            href={`/employee/zone/${cell.id}`}
            code={cell.code}
            health={cell.health}
            speciesName={cell.speciesName}
          />
        ))}
      </div>
    </div>
  );
}
