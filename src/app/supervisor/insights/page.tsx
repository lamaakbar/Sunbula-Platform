import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/ui/Feedback";
import { getForecastingService } from "@/services/forecasting";
import { numberFmt } from "@/lib/format";

export default async function InsightsPage() {
  const { nurseryId, nurseryName } = await supervisorContext();
  const forecast = getForecastingService();
  const [demandNote, shortageNote] = await Promise.all([forecast.demand(), forecast.shortage()]);

  const [inventory, requests, targets, alerts, operations] = await Promise.all([
    prisma.inventoryItem.findMany({ where: { nurseryId }, include: { species: true } }),
    prisma.seedlingRequest.findMany({ where: { nurseryId, status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED"] } }, include: { species: true } }),
    prisma.productionTarget.findMany({ where: { nurseryId }, include: { species: true } }),
    prisma.alert.groupBy({ by: ["type"], where: { nurseryId, status: { in: ["OPEN", "ACKNOWLEDGED"] } }, _count: true }),
    prisma.dailyOperation.findMany({ where: { nurseryId }, select: { type: true, amount: true } }),
  ]);

  const ready = inventory.filter((item) => item.state === "READY").reduce((sum, item) => sum + item.quantity, 0);
  const production = inventory.filter((item) => item.state === "IN_PRODUCTION").reduce((sum, item) => sum + item.quantity, 0);
  const requested = requests.reduce((sum, item) => sum + item.quantity, 0);
  const target = targets.reduce((sum, item) => sum + item.targetQuantity, 0);
  const waterOps = operations.filter((item) => item.type === "IRRIGATION");

  return (
    <div>
      <PageHeader eyebrow={nurseryName} title="Insights & reports" description="Operational comparisons from nursery records. Predictive models are not active in this MVP." />

      <section className="mt-2">
        <h2 className="text-xl font-semibold text-forest">Demand</h2>
        <p className="mt-2 text-sm text-muted">Based on open requests by species — not a forecast model.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {requests.length === 0 ? (
            <StatCard label="Open request volume" value={0} />
          ) : (
            requests.map((item) => (
              <StatCard key={item.id} label={item.species.commonName} value={numberFmt(item.quantity)} hint={item.reason} />
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">Shortage risk</h2>
        <p className="mt-2 rounded-2xl bg-sand/80 px-4 py-3 text-sm text-muted">{shortageNote.message}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Current production" value={numberFmt(production)} />
          <StatCard label="Ready stock" value={numberFmt(ready)} />
          <StatCard label="Open requests" value={numberFmt(requested)} />
          <StatCard label="Assigned targets" value={numberFmt(target)} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">Yield & capacity</h2>
        <p className="mt-2 text-sm text-muted">{demandNote.message}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard label="In production" value={numberFmt(production)} />
          <StatCard label="Ready" value={numberFmt(ready)} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">Water</h2>
        <StatCard label="Irrigation events recorded" value={waterOps.length} hint="Live consumption meters are not connected. This is operational activity." />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">Plant health</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {alerts.map((item) => (
            <StatCard key={item.type} label={item.type.replaceAll("_", " ")} value={item._count} />
          ))}
        </div>
      </section>
    </div>
  );
}
