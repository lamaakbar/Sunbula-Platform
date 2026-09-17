import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { ImageForm } from "@/components/forms/ImageForm";

export default async function UploadImagePage({ params }: { params: Promise<{ cellId: string }> }) {
  const user = await requireRole("EMPLOYEE");
  const { cellId } = await params;
  const cell = await getAccessibleCell(user, cellId);

  return (
    <div>
      <Breadcrumbs items={[{ href: `/employee/zone/${cell.id}`, label: cell.code }, { label: "Upload image" }]} />
      <PageHeader title="Upload plant image" description="Photos stay attached to this cell, species, nursery and the person who took them." />
      <ImageForm cellId={cell.id} />
    </div>
  );
}
