import Link from "next/link";
import { startTaskAction } from "@/app/actions/tasks";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { TaskCard } from "@/components/data/OpsCards";
import { Button } from "@/components/ui/Button";
import { SavedToast } from "@/components/feedback/SavedToast";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function TasksPage() {
  const { user, zoneLabel } = await employeeContext();
  const locale = await getLocale();
  const copy = messages(locale);
  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id },
    include: { plantCell: true, zone: true, batch: { include: { species: true } } },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
  });

  const today = tasks.filter((task) => task.status === "PENDING" || task.status === "IN_PROGRESS" || task.status === "OVERDUE");
  const completed = tasks.filter((task) => task.status === "COMPLETED");

  return (
    <div>
      <SavedToast />
      <PageHeader
        eyebrow={zoneLabel}
        title={copy.employee.tasksTitle}
        description={copy.employee.tasksLead}
      />
      {today.length === 0 ? (
        <EmptyState title={copy.employee.noTasks} description={copy.employee.noTasksBody} />
      ) : (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-forest">{copy.employee.today}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {today.map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                zone={task.zone?.name}
                cell={task.plantCell?.code}
                species={task.batch?.species.commonName}
                dueAt={task.dueAt}
                status={task.status}
                priority={task.priority}
                action={
                  task.status === "COMPLETED" ? null : (
                    <form action={startTaskAction.bind(null, task.id)}>
                      <Button type="submit" className="w-full sm:w-auto">
                        {task.status === "IN_PROGRESS" ? copy.employee.continue : copy.employee.start}
                      </Button>
                    </form>
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-forest">{copy.employee.completed}</h2>
        {completed.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{copy.employee.completedEmpty}</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {completed.slice(0, 6).map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={`${copy.employee.completed}${task.completedAt ? ` · ${task.completedAt.toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}`}
                zone={task.zone?.name}
                cell={task.plantCell?.code}
                status={task.status}
                priority={task.priority}
                href={task.plantCellId ? `/employee/zone/${task.plantCellId}` : undefined}
              />
            ))}
          </div>
        )}
      </section>

      <p className="mt-8 text-sm text-muted">
        {copy.employee.needPlant} <Link className="font-semibold text-forest" href="/employee/zone">{copy.employee.openZone}</Link>
      </p>
    </div>
  );
}
