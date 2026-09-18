import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { OperationForm } from "@/components/forms/OperationForm";
import type { OperationType } from "@prisma/client";

export default async function OperatePage({
  params,
  searchParams,
}: {
  params: Promise<{ cellId: string }>;
  searchParams: Promise<{ type?: string; taskId?: string }>;
}) {
  const user = await requireRole("EMPLOYEE");
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
          { label: "Log operation" },
        ]}
      />
      <PageHeader title="Log operation" description="Choose what you did, then save. SUNBULA will update history and any related task." />
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
