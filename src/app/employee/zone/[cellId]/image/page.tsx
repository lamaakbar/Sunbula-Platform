import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { ImageForm } from "@/components/forms/ImageForm";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function UploadImagePage({ params }: { params: Promise<{ cellId: string }> }) {
  const user = await requireRole("EMPLOYEE");
  const copy = messages(await getLocale());
  const { cellId } = await params;
  const cell = await getAccessibleCell(user, cellId);

  return (
    <div>
      <Breadcrumbs items={[{ href: `/employee/zone/${cell.id}`, label: cell.code }, { label: copy.employee.upload }]} />
      <PageHeader title={copy.employee.upload} description={copy.employee.uploadLead} />
      <ImageForm cellId={cell.id} />
    </div>
  );
}
