import Link from "next/link";
import { getEmployeeHome } from "@/lib/data/employee";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { PlantCellCard } from "@/components/data/Cards";
import { Button } from "@/components/ui/Button";

export default async function MyZonePage() {
  const data = await getEmployeeHome();

  return (
    <div>
      <PageHeader
        eyebrow={data.nurseryName}
        title={data.zone.name}
        description="Your assigned cells. Open any cell to log work, add a reading, or view history."
        actions={
          <Link href="/employee/add">
            <Button>Add plant / batch</Button>
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Healthy" value={data.summary.healthy} tone="healthy" />
        <StatCard label="Needs attention" value={data.summary.attention} tone="attention" />
        <StatCard label="Critical" value={data.summary.critical} tone="critical" />
        <StatCard label="No recent data" value={data.summary.noData} />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Average moisture"
          value={data.avgMoisture == null ? "—" : `${data.avgMoisture}%`}
          tone="water"
        />
        <StatCard label="Operations today" value={data.operationsToday} />
        <StatCard label="Open alerts" value={data.alerts} tone={data.alerts ? "attention" : "default"} />
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
