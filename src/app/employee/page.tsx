import Link from "next/link";
import { Bell, HeartPulse, ListChecks } from "lucide-react";
import { getEmployeeHome } from "@/lib/data/employee";
import { greetingFor } from "@/lib/format";
import { StatCard } from "@/components/ui/Feedback";
import { PlantCellCard } from "@/components/data/Cards";
import { BotanicalMark, SectionHeading } from "@/components/brand/BotanicalMark";
import { Button } from "@/components/ui/Button";

export default async function EmployeeHomePage() {
  const data = await getEmployeeHome();
  const firstName = data.user.fullName.split(" ")[0];

  return (
    <div>
      <section className="relative mb-7 overflow-hidden rounded-[2rem] bg-white p-6 ring-1 ring-sand sm:p-8">
        <BotanicalMark className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 text-sage/30" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{data.nurseryName}</p>
        <h1 className="mt-2 text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold tracking-tight text-forest">
          {greetingFor()}, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          {data.zone.name} · here is what needs your attention today.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-light-sage px-3 py-1.5 text-sm font-medium text-forest">{data.zone.name}</span>
          <span className="rounded-full bg-cream px-3 py-1.5 text-sm font-medium text-muted">
            {data.cells.length} plant cells
          </span>
        </div>
        <div className="mt-6">
          <Link href="/employee/tasks">
            <Button size="lg">View my tasks</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Today's tasks" value={data.tasks.length} hint="Assigned to you" icon={<ListChecks className="h-5 w-5" />} />
        <Link href="/employee/alerts" className="block">
          <StatCard
            label="Open alerts"
            value={data.alerts}
            tone={data.alerts > 0 ? "attention" : "healthy"}
            icon={<Bell className="h-5 w-5" />}
          />
        </Link>
        <StatCard
          label="Zone health"
          value={`${data.summary.score}%`}
          tone="healthy"
          hint={`${data.summary.healthy} healthy cells`}
          icon={<HeartPulse className="h-5 w-5" />}
        />
      </section>

      <section className="mt-10">
        <SectionHeading
          title="My zone"
          description={`${data.zone.name} · ${data.cells.length} plant cells`}
          action={
            <Link href="/employee/zone" className="text-sm font-semibold text-forest">
              Open full grid
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.cells.slice(0, 8).map((cell) => (
            <PlantCellCard
              key={cell.id}
              href={`/employee/zone/${cell.id}`}
              code={cell.code}
              health={cell.health}
              speciesName={cell.speciesName}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
