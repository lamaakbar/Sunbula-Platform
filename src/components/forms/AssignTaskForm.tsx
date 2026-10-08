"use client";

import { useActionState } from "react";
import { assignTaskAction } from "@/app/actions/tasks";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function AssignTaskForm({
  assigneeId,
  zones,
}: {
  assigneeId: string;
  zones: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(assignTaskAction, {} as ActionState);
  const copy = useMessages();
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-sand bg-white p-5">
      <input type="hidden" name="assigneeId" value={assigneeId} />
      <h3 className="text-lg font-semibold text-forest">{copy.forms.assign}</h3>
      <FormField label={copy.forms.title} htmlFor="title">
        <TextInput id="title" name="title" required />
      </FormField>
      <FormField label={copy.forms.whatDo} htmlFor="description">
        <TextArea id="description" name="description" required />
      </FormField>
      <FormField label={copy.forms.zone} htmlFor="zoneId">
        <SelectField id="zoneId" name="zoneId">
          <option value="">Nursery-wide</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label={copy.forms.priority} htmlFor="priority">
        <SelectField id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">{copy.priority.LOW}</option>
          <option value="MEDIUM">{copy.priority.MEDIUM}</option>
          <option value="HIGH">{copy.priority.HIGH}</option>
          <option value="URGENT">{copy.priority.URGENT}</option>
        </SelectField>
      </FormField>
      <FormField label={copy.forms.due} htmlFor="dueAt">
        <TextInput id="dueAt" name="dueAt" type="datetime-local" />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.forms.submitting : copy.forms.assign}
      </Button>
    </form>
  );
}
