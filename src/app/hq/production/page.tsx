import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { ProductionTargetForm } from "@/components/forms/ProductionTargetForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { formatDate, numberFmt } from "@/lib/format";

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("HQ");
  const { saved } = await searchParams;
  const [nurseries, species, targets] = await Promise.all([
    prisma.nursery.findMany({ orderBy: { name: "asc" } }),
    prisma.species.findMany({ orderBy: { commonName: "asc" } }),
    prisma.productionTarget.findMany({
      include: { nursery: true, species: true },
      orderBy: { targetDate: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SavedToast value={saved} />
      <div>
        <PageHeader title="Production planning" description="Allocate targets to nurseries. Transfer between nurseries is not assumed." />
        <ProductionTargetForm
          nurseries={nurseries.map((item) => ({ id: item.id, name: item.name }))}
          species={species.map((item) => ({ id: item.id, commonName: item.commonName }))}
        />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-forest">Current targets</h2>
        <ul className="mt-4 space-y-3">
          {targets.map((target) => (
            <li key={target.id} className="rounded-3xl border border-sand bg-white p-4">
              <p className="font-semibold text-forest">
                {target.nursery.name} · {target.species.commonName}
              </p>
              <p className="text-sm text-muted">
                {numberFmt(target.targetQuantity)} by {formatDate(target.targetDate)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
