import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { RequestForm } from "@/components/forms/RequestForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { formatDate } from "@/lib/format";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function SupervisorRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { nurseryId, nurseryName } = await supervisorContext();
  const copy = messages(await getLocale());
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
        <PageHeader title={copy.supervisor.requestsTitle} description={copy.supervisor.requestsLead} />
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
        <h2 className="text-xl font-semibold text-forest">{copy.supervisor.submitted}</h2>
        <ul className="mt-4 space-y-3">
          {requests.map((request) => (
            <li key={request.id} className="rounded-3xl border border-sand bg-white p-4">
              <p className="font-semibold text-forest">
                {request.species.commonName} · {request.quantity}
              </p>
              <p className="text-sm text-muted">
                {copy.request[request.status]} · {copy.supervisor.required} {formatDate(request.requiredDate)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
