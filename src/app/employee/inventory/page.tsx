import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { InventoryRowForm } from "@/components/forms/InventoryRowForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { numberFmt } from "@/lib/format";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { nurseryId, nurseryName } = await employeeContext();
  const { saved } = await searchParams;
  const items = await prisma.inventoryItem.findMany({
    where: { nurseryId, state: { in: ["READY", "IN_PRODUCTION"] } },
    include: { species: true },
    orderBy: [{ species: { commonName: "asc" } }, { state: "asc" }],
  });

  return (
    <div>
      <SavedToast value={saved} />
      <PageHeader
        eyebrow={nurseryName}
        title="Inventory"
        description="Update ready stock and in-progress stock for your nursery. Allocated and distributed stock is managed at nursery level."
      />
      {items.length === 0 ? (
        <EmptyState title="No stock records" description="Inventory appears here after plants are added to the nursery." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-sand bg-white">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 border-b border-sand px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-forest">{item.species.commonName}</p>
                <p className="text-sm text-muted">
                  {item.state === "READY" ? "Ready stock" : "In-progress stock"} · {numberFmt(item.quantity)}
                </p>
              </div>
              <InventoryRowForm inventoryId={item.id} quantity={item.quantity} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
