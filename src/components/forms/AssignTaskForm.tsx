"use client";

import { useActionState } from "react";
import { assignTaskAction } from "@/app/actions/tasks";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";

export function AssignTaskForm({
  assigneeId,
  zones,
}: {
  assigneeId: string;
  zones: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(assignTaskAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-sand bg-white p-5">
      <input type="hidden" name="assigneeId" value={assigneeId} />
      <h3 className="text-lg font-semibold text-forest">Assign an operational task</h3>
      <FormField label="Title" htmlFor="title">
        <TextInput id="title" name="title" required />
      </FormField>
      <FormField label="What should they do?" htmlFor="description">
        <TextArea id="description" name="description" required />
      </FormField>
      <FormField label="Zone" htmlFor="zoneId">
        <SelectField id="zoneId" name="zoneId">
          <option value="">Nursery-wide</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label="Priority" htmlFor="priority">
        <SelectField id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </SelectField>
      </FormField>
      <FormField label="Required by (optional)" htmlFor="dueAt">
        <TextInput id="dueAt" name="dueAt" type="datetime-local" />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Assigning…" : "Assign task"}
      </Button>
    </form>
  );
}
