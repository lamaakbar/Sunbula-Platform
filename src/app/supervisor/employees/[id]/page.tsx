import { notFound } from "next/navigation";
import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, PageHeader } from "@/components/ui/Feedback";
import { AssignTaskForm } from "@/components/forms/AssignTaskForm";
import { SavedToast } from "@/components/feedback/SavedToast";
import { formatDateTime } from "@/lib/format";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function EmployeeActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { nurseryId } = await supervisorContext();
  const locale = await getLocale();
  const copy = messages(locale);
  const { id } = await params;
  const { saved } = await searchParams;
  const employee = await prisma.user.findFirst({
    where: { id, nurseryId, role: "EMPLOYEE" },
    include: {
      zoneAssignments: { include: { zone: true } },
      assignedTasks: { include: { plantCell: true, zone: true }, orderBy: { createdAt: "desc" } },
      operations: { include: { plantCell: true }, orderBy: { occurredAt: "desc" }, take: 12 },
    },
  });
  if (!employee) notFound();

  const zones = await prisma.zone.findMany({ where: { nurseryId }, orderBy: { code: "asc" } });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <SavedToast value={saved} />
      <div>
        <Breadcrumbs items={[{ href: "/supervisor/employees", label: copy.supervisor.teamTitle }, { label: employee.fullName }]} />
        <PageHeader
          title={employee.fullName}
          description={`Assigned: ${employee.zoneAssignments.map((item) => item.zone.name).join(", ") || "None"}`}
        />
        <section>
          <h2 className="text-xl font-semibold text-forest">{copy.employee.tasksTitle}</h2>
          <ul className="mt-3 space-y-3">
            {employee.assignedTasks.map((task) => (
              <li key={task.id} className="rounded-3xl border border-sand bg-white p-4">
                <p className="font-semibold text-forest">{task.title}</p>
                <p className="text-sm text-muted">
                  {copy.task[task.status]} · {task.zone?.name ?? copy.forms.nursery} {task.plantCell ? `· ${task.plantCell.code}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-forest">{copy.supervisor.activity}</h2>
          <ul className="mt-3 space-y-3">
            {employee.operations.map((op) => (
              <li key={op.id} className="rounded-3xl border border-sand bg-white p-4">
                <p className="font-semibold">{op.type.replaceAll("_", " ")} · {op.plantCell?.code}</p>
                <p className="text-sm text-muted">{formatDateTime(op.occurredAt)} · {relativeText(locale, op.occurredAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <AssignTaskForm
        assigneeId={employee.id}
        zones={zones.map((zone) => ({ id: zone.id, name: zone.name }))}
      />
    </div>
  );
}
