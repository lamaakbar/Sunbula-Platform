import Link from "next/link";
import { supervisorContext } from "@/lib/data/supervisor";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { SavedToast } from "@/components/feedback/SavedToast";
import { relativeTime } from "@/lib/format";

export default async function EmployeesPage() {
  const { nurseryId, nurseryName } = await supervisorContext();
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
      <PageHeader eyebrow={nurseryName} title="Team" description="Operational coordination — assigned zones, tasks and recent field activity." />
      <div className="grid gap-4 md:grid-cols-2">
        {employees.map((employee) => {
          const tasks = employee.assignedTasks;
          const open = tasks.filter((task) => task.status !== "COMPLETED");
          const done = tasks.filter((task) => task.status === "COMPLETED");
          return (
            <article key={employee.id} className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-forest">{employee.fullName}</h2>
              <p className="mt-1 text-sm text-muted">
                {employee.zoneAssignments.map((item) => item.zone.name).join(", ") || "No zone assigned"}
              </p>
              <p className="mt-4 text-sm">
                Today: <span className="font-semibold">{done.length} / {tasks.length || open.length} tasks</span>
              </p>
              <p className="text-sm text-muted">
                Last update: {employee.operations[0] ? relativeTime(employee.operations[0].occurredAt) : "No activity yet"}
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
