"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { recordEvent } from "@/services/events";
import { assignTaskSchema } from "@/lib/validations";
import type { ActionState } from "@/app/actions/operations";

export async function startTaskAction(taskId: string) {
  const user = await requireRole("EMPLOYEE");
  const task = await prisma.task.findFirst({
    where: { id: taskId, assigneeId: user.id },
  });
  if (!task) redirect("/employee/tasks");

  if (task.status === "PENDING" || task.status === "OVERDUE") {
    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: task.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
      await recordEvent(tx, {
        eventType: "TASK_STARTED",
        userId: user.id,
        nurseryId: task.nurseryId,
        zoneId: task.zoneId,
        plantCellId: task.plantCellId,
        batchId: task.batchId,
        relatedEntityType: "Task",
        relatedEntityId: task.id,
        details: { title: task.title },
      });
    });
  }

  revalidatePath("/employee/tasks");
  if (task.plantCellId && task.type === "WATERING") {
    redirect(`/employee/zone/${task.plantCellId}/operate?taskId=${task.id}&type=IRRIGATION`);
  }
  if (task.plantCellId) {
    redirect(`/employee/zone/${task.plantCellId}`);
  }
  redirect("/employee/tasks");
}

export async function assignTaskAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("SUPERVISOR");
  if (!user.nurseryId) return { error: "No nursery is assigned to this account." };

  const parsed = assignTaskSchema.safeParse({
    assigneeId: formData.get("assigneeId"),
    title: formData.get("title"),
    description: formData.get("description"),
    zoneId: formData.get("zoneId") || undefined,
    cellId: formData.get("cellId") || undefined,
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete the task details." };
  }

  const assignee = await prisma.user.findFirst({
    where: { id: parsed.data.assigneeId, nurseryId: user.nurseryId, role: "EMPLOYEE" },
  });
  if (!assignee) return { error: "That employee is not in your nursery." };

  const task = await prisma.task.create({
    data: {
      type: "GENERAL",
      title: parsed.data.title,
      description: parsed.data.description,
      status: "PENDING",
      priority: parsed.data.priority,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      nurseryId: user.nurseryId,
      zoneId: parsed.data.zoneId || null,
      plantCellId: parsed.data.cellId || null,
      assigneeId: assignee.id,
    },
  });

  await recordEvent(prisma, {
    eventType: "TASK_ASSIGNED",
    userId: user.id,
    nurseryId: user.nurseryId,
    zoneId: parsed.data.zoneId,
    plantCellId: parsed.data.cellId,
    relatedEntityType: "Task",
    relatedEntityId: task.id,
    details: { title: task.title, assignee: assignee.fullName },
  });

  revalidatePath("/supervisor/employees");
  revalidatePath("/employee/tasks");
  redirect(`/supervisor/employees/${assignee.id}?saved=task`);
}
