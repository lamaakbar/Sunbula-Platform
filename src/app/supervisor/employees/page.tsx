import Link from "next/link";
import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { SavedToast } from "@/components/feedback/SavedToast";
import { messages, relativeText } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function EmployeesPage() {
  const { nurseryId, nurseryName } = await supervisorContext();
  const locale = await getLocale();
  const copy = messages(locale);
  const employees = await prisma.user.findMany({
    where: { nurseryId, role: "EMPLOYEE" },
    include: {
      zoneAssignments: { include: { zone: true } },
      assignedTasks: true,
      operations: { orderBy: { occurredAt: "desc" }, take: 1 },
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div>
      <SavedToast />
      <PageHeader eyebrow={nurseryName} title={copy.supervisor.teamTitle} description={copy.supervisor.teamLead} />
      <div className="grid gap-4 md:grid-cols-2">
        {employees.map((employee) => {
          const tasks = employee.assignedTasks;
          const open = tasks.filter((task) => task.status !== "COMPLETED");
          const done = tasks.filter((task) => task.status === "COMPLETED");
          return (
            <article key={employee.id} className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-forest">{employee.fullName}</h2>
              <p className="mt-1 text-sm text-muted">
                {employee.zoneAssignments.map((item) => item.zone.name).join(", ") || copy.common.none}
              </p>
              <p className="mt-4 text-sm">
                {copy.employee.today}: <span className="font-semibold">{done.length} / {tasks.length || open.length}</span>
              </p>
              <p className="text-sm text-muted">
                {employee.operations[0] ? relativeText(locale, employee.operations[0].occurredAt) : copy.employee.noActivity}
              </p>
              <Link href={`/supervisor/employees/${employee.id}`} className="mt-4 inline-flex min-h-11 items-center font-semibold text-forest">
                View activity
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
