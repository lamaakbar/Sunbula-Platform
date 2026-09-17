import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { RequestForm } from "@/components/forms/RequestForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { formatDate, requestStatusLabel } from "@/lib/format";

export default async function SupervisorRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { nurseryId, nurseryName } = await supervisorContext();
  const { saved } = await searchParams;
  const [species, requests, inventory] = await Promise.all([
    prisma.species.findMany({ orderBy: { commonName: "asc" } }),
    prisma.seedlingRequest.findMany({
      where: { nurseryId },
      include: { species: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryItem.findMany({ where: { nurseryId, state: "READY" } }),
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SavedToast value={saved} />
      <div>
        <PageHeader title="Request seedlings" description="Requests go to HQ. You can track review status here." />
        <RequestForm
          nurseryName={nurseryName}
          species={species.map((item) => ({
            id: item.id,
            commonName: item.commonName,
            stock: inventory.find((row) => row.speciesId === item.id)?.quantity ?? 0,
          }))}
        />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-forest">Submitted requests</h2>
        <ul className="mt-4 space-y-3">
          {requests.map((request) => (
            <li key={request.id} className="rounded-3xl border border-sand bg-white p-4">
              <p className="font-semibold text-forest">
                {request.species.commonName} · {request.quantity}
              </p>
              <p className="text-sm text-muted">
                {requestStatusLabel[request.status]} · required {formatDate(request.requiredDate)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
