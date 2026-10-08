import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { InventoryRowForm } from "@/components/forms/InventoryRowForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { numberFmt } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { nurseryId, nurseryName } = await employeeContext();
  const copy = messages(await getLocale());
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
        title={copy.employee.inventoryTitle}
        description={copy.employee.inventoryLead}
      />
      {items.length === 0 ? (
        <EmptyState title={copy.employee.noStock} description={copy.employee.noStockBody} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-sand bg-white">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 border-b border-sand px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-forest">{item.species.commonName}</p>
                <p className="text-sm text-muted">
                  {item.state === "READY" ? copy.supervisor.ready : copy.supervisor.inProduction} · {numberFmt(item.quantity)}
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
