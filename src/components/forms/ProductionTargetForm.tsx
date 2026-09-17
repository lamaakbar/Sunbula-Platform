"use client";

import { useActionState } from "react";
import { createProductionTargetAction } from "@/app/actions/management";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";

export function ProductionTargetForm({
  nurseries,
  species,
}: {
  nurseries: Array<{ id: string; name: string }>;
  species: Array<{ id: string; commonName: string }>;
}) {
  const [state, action, pending] = useActionState(createProductionTargetAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-sand bg-white p-5">
      <FormField label="Nursery" htmlFor="nurseryId">
        <SelectField id="nurseryId" name="nurseryId" required>
          {nurseries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label="Species" htmlFor="speciesId">
        <SelectField id="speciesId" name="speciesId" required>
          {species.map((item) => (
            <option key={item.id} value={item.id}>
              {item.commonName}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label="Target quantity" htmlFor="targetQuantity">
        <TextInput id="targetQuantity" name="targetQuantity" type="number" min={1} required />
      </FormField>
      <FormField label="Target date" htmlFor="targetDate">
        <TextInput id="targetDate" name="targetDate" type="date" required />
      </FormField>
      <FormField label="Notes" htmlFor="notes">
        <TextArea id="notes" name="notes" placeholder="Coordination notes. This does not assume nursery-to-nursery transfer." />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save target"}
      </Button>
    </form>
  );
}
