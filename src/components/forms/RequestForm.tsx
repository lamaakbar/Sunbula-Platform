"use client";

import { useActionState } from "react";
import { submitRequestAction } from "@/app/actions/management";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";

export function RequestForm({
  nurseryName,
  species,
}: {
  nurseryName: string;
  species: Array<{ id: string; commonName: string; stock: number }>;
}) {
  const [state, action, pending] = useActionState(submitRequestAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-sand bg-white p-5">
      <FormField label="Requesting nursery">
        <TextInput readOnly value={nurseryName} />
      </FormField>
      <FormField label="Species" htmlFor="speciesId">
        <SelectField id="speciesId" name="speciesId" required>
          {species.map((item) => (
            <option key={item.id} value={item.id}>
              {item.commonName} · stock {item.stock}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label="Quantity" htmlFor="quantity">
        <TextInput id="quantity" name="quantity" type="number" min={1} required />
      </FormField>
      <FormField label="Required date" htmlFor="requiredDate">
        <TextInput id="requiredDate" name="requiredDate" type="date" required />
      </FormField>
      <FormField label="Reason / purpose" htmlFor="reason">
        <TextArea id="reason" name="reason" required />
      </FormField>
      <FormField label="Priority" htmlFor="priority">
        <SelectField id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </SelectField>
      </FormField>
      <FormField label="Notes" htmlFor="notes">
        <TextArea id="notes" name="notes" />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
