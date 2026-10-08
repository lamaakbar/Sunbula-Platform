import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { workflowCopy } from "@/lib/workflow-copy";
import { countByStatus, filterUpdates, listBatchUpdates, toUpdateRow } from "@/lib/batch-updates";
import { messages } from "@/lib/i18n";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { SavedToast } from "@/components/feedback/SavedToast";
import { BatchUpdateForm, ResubmitForm } from "@/components/workflow/BatchUpdateForms";
import { StatusTabs, UpdateRows, UpdateSearch } from "@/components/workflow/UpdateList";

const tabs = new Set(["PENDING", "NEEDS_REVISION", "APPROVED", "REJECTED", "ALL"]);

export default async function EmployeeUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; sort?: string; id?: string; saved?: string }>;
}) {
  const { user, zone } = await employeeContext();
  const params = await searchParams;
  const locale = await getLocale();
  const copy = workflowCopy(locale);
  const ui = messages(locale);
  const tab = params.tab && tabs.has(params.tab) ? params.tab : "PENDING";
  const q = params.q ?? "";
  const sort = params.sort === "oldest" || params.sort === "quantity" ? params.sort : "newest";

  const [records, batches] = await Promise.all([
    listBatchUpdates({ submittedById: user.id, zoneId: zone.id }),
    prisma.seedlingBatch.findMany({
      where: { zoneId: zone.id, isActive: true },
      include: { species: true },
      orderBy: { code: "asc" },
    }),
  ]);

  const counts = countByStatus(records);
  const rows = records.map((item) => ({
    ...toUpdateRow(item, locale === "ar" ? "أنت" : "You"),
    updatedAt: item.updatedAt,
  }));
  const visible = filterUpdates(rows, tab, q, sort);
  const selected = rows.find((row) => row.id === params.id) ?? visible[0];
  const statusLabel = (status: keyof typeof counts) =>
    status === "NEEDS_REVISION"
      ? copy.revision
      : status === "APPROVED"
        ? copy.approved
        : status === "REJECTED"
          ? copy.rejected
          : status === "ALL"
            ? copy.all
            : copy.pending;

  return (
    <div>
      <SavedToast value={params.saved} />
      <PageHeader eyebrow={zone.name} title={copy.updatesTitle} description={copy.employeeLead} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <StatusTabs base="/employee/updates" tab={tab} counts={counts} copy={copy} />
          <UpdateSearch base="/employee/updates" tab={tab} q={q} sort={sort} copy={copy} />
          {visible.length === 0 ? (
            <div className="mt-4">
              <EmptyState title={copy.empty} description={copy.employeeLead} />
            </div>
          ) : (
            <UpdateRows
              rows={visible}
              base="/employee/updates"
              tab={tab}
              q={q}
              sort={sort}
              selectedId={selected?.id}
              statusLabel={(status) => statusLabel(status)}
            />
          )}
        </section>
        <aside className="rounded-[1.7rem] bg-white p-5 ring-1 ring-sand lg:sticky lg:top-24">
          {selected ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf">{statusLabel(selected.status)}</p>
              <h2 className="mt-2 text-xl font-semibold text-forest">
                {selected.code} · {selected.species}
              </h2>
              <p className="mt-3 text-sm text-muted">
                {copy.from} {selected.previousQuantity} / {ui.growth[selected.previousStage]} {copy.to} {selected.proposedQuantity} /{" "}
                {ui.growth[selected.proposedStage]}
              </p>
              <p className="mt-4 text-sm font-semibold text-forest">{copy.yourNote}</p>
              <p className="mt-1 text-sm leading-6">{selected.notes}</p>
              {selected.feedback ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-forest">{copy.supervisorNote}</p>
                  <p className="mt-1 text-sm leading-6">{selected.feedback}</p>
                  {selected.reviewer ? (
                    <p className="mt-1 text-xs text-muted">
                      {selected.reviewer}
                      {selected.reviewedAt ? ` · ${selected.reviewedAt}` : ""}
                    </p>
                  ) : null}
                </>
              ) : null}
              {selected.status === "NEEDS_REVISION" ? (
                <ResubmitForm
                  updateId={selected.id}
                  batchId={records.find((item) => item.id === selected.id)?.batchId ?? ""}
                  quantity={selected.proposedQuantity}
                  stage={selected.proposedStage}
                  notes={selected.notes}
                  copy={copy}
                />
              ) : null}
            </div>
          ) : null}
          {selected?.status === "NEEDS_REVISION" ? null : (
            <div className={selected ? "mt-6 border-t border-sand pt-4" : ""}>
              <h2 className="text-lg font-semibold text-forest">{copy.record}</h2>
              <div className="mt-4">
                <BatchUpdateForm
                  copy={copy}
                  batches={batches.map((batch) => ({
                    id: batch.id,
                    code: batch.code,
                    species: batch.species.commonName,
                    quantity: batch.quantity,
                    stage: batch.growthStage,
                  }))}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
