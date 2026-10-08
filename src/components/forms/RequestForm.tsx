"use client";

import { useActionState } from "react";
import { submitRequestAction } from "@/app/actions/management";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function RequestForm({
  nurseryName,
  species,
}: {
  nurseryName: string;
  species: Array<{ id: string; commonName: string; stock: number }>;
}) {
  const [state, action, pending] = useActionState(submitRequestAction, {} as ActionState);
  const copy = useMessages();
  return (
    <form action={action} className="space-y-4 rounded-3xl border border-sand bg-white p-5">
      <FormField label={copy.forms.requesting}>
        <TextInput readOnly value={nurseryName} />
      </FormField>
      <FormField label={copy.forms.species} htmlFor="speciesId">
        <SelectField id="speciesId" name="speciesId" required>
          {species.map((item) => (
            <option key={item.id} value={item.id}>
              {item.commonName} · stock {item.stock}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label={copy.forms.quantity} htmlFor="quantity">
        <TextInput id="quantity" name="quantity" type="number" min={1} required />
      </FormField>
      <FormField label={copy.forms.requiredDate} htmlFor="requiredDate">
        <TextInput id="requiredDate" name="requiredDate" type="date" required />
      </FormField>
      <FormField label={copy.forms.reason} htmlFor="reason">
        <TextArea id="reason" name="reason" required />
      </FormField>
      <FormField label={copy.forms.priority} htmlFor="priority">
        <SelectField id="priority" name="priority" defaultValue="MEDIUM">
          <option value="LOW">{copy.priority.LOW}</option>
          <option value="MEDIUM">{copy.priority.MEDIUM}</option>
          <option value="HIGH">{copy.priority.HIGH}</option>
          <option value="URGENT">{copy.priority.URGENT}</option>
        </SelectField>
      </FormField>
      <FormField label={copy.forms.notes} htmlFor="notes">
        <TextArea id="notes" name="notes" />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? copy.forms.submitting : copy.forms.submitRequest}
      </Button>
    </form>
  );
}
