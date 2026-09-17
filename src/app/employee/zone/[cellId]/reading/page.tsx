import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { ReadingForm } from "@/components/forms/ReadingForm";

export default async function AddReadingPage({ params }: { params: Promise<{ cellId: string }> }) {
  const user = await requireRole("EMPLOYEE");
  const { cellId } = await params;
  const cell = await getAccessibleCell(user, cellId);

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: `/employee/zone/${cell.id}`, label: cell.code },
          { label: "Add reading" },
        ]}
      />
      <PageHeader
        title="Add manual reading"
        description="Do not re-enter a value that already came from a sensor. Use this when you measured it yourself."
      />
      <ReadingForm cellId={cell.id} />
    </div>
  );
}
