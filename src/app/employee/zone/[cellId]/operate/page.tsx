import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { OperationForm } from "@/components/forms/OperationForm";
import type { OperationType } from "@prisma/client";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function OperatePage({
  params,
  searchParams,
}: {
  params: Promise<{ cellId: string }>;
  searchParams: Promise<{ type?: string; taskId?: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
  const copy = messages(await getLocale());
  const { cellId } = await params;
  const query = await searchParams;
  const cell = await getAccessibleCell(user, cellId);
  const defaultType = isOperationType(query.type) ? query.type : "IRRIGATION";

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: "/employee/zone", label: cell.zone.name },
          { href: `/employee/zone/${cell.id}`, label: cell.code },
          { label: copy.employee.logOp },
        ]}
      />
      <PageHeader title={copy.employee.logOp} description={copy.employee.logOpLead} />
      <OperationForm
        cellId={cell.id}
        cellCode={cell.code}
        zoneName={cell.zone.name}
        defaultType={defaultType}
        taskId={query.taskId}
      />
    </div>
  );
}

function isOperationType(value?: string): value is OperationType {
  return ["IRRIGATION", "FERTILIZATION", "REPLANTING", "INSPECTION", "OTHER"].includes(value ?? "");
}
