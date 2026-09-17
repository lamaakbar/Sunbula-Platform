import Link from "next/link";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { ReviewActions } from "@/components/forms/ReviewActions";
import { SavedToast } from "@/components/feedback/SavedToast";
import { formatDate, numberFmt, requestStatusLabel } from "@/lib/format";
import type { RequestStatus } from "@prisma/client";

export default async function HqRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; saved?: string }>;
}) {
  await requireRole("HQ");
  const { tab, saved } = await searchParams;
  const status = tab && tab !== "ALL" && tab !== "URGENT" ? (tab as RequestStatus) : undefined;
  const requests = await prisma.seedlingRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(tab === "URGENT" ? { priority: "URGENT" } : {}),
    },
    include: { nursery: true, species: true, submittedBy: true },
    orderBy: { createdAt: "desc" },
  });

  const tabs = ["ALL", "PENDING", "URGENT", "APPROVED", "REJECTED"] as const;

  return (
    <div>
      <SavedToast value={saved} />
      <PageHeader title="Request center" description="Operational inbox for nursery seedling requests." />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link
            key={item}
            href={item === "ALL" ? "/hq/requests" : `/hq/requests?tab=${item}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item || (!tab && item === "ALL") ? "bg-forest text-white" : "bg-white text-forest"}`}
          >
            {item.replaceAll("_", " ")}
          </Link>
        ))}
      </div>
      <div className="space-y-4">
        {requests.map((request) => (
          <article key={request.id} className="rounded-3xl border border-sand bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold">{request.priority}</span>
              <span className="rounded-full bg-light-sage px-2.5 py-1 text-xs font-semibold text-leaf">
                {requestStatusLabel[request.status]}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-forest">
              {request.nursery.name} · {request.species.commonName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {numberFmt(request.quantity)} requested · required {formatDate(request.requiredDate)} · current stock {numberFmt(request.currentStock)}
            </p>
            <p className="mt-3 text-sm">{request.reason}</p>
            <p className="mt-1 text-xs text-muted">Submitted by {request.submittedBy.fullName}</p>
            <div className="mt-5">
              <ReviewActions requestId={request.id} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
