"use client";

import { useActionState } from "react";
import { addManualReadingAction } from "@/app/actions/readings";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function ReadingForm({ cellId }: { cellId: string }) {
  const [state, action, pending] = useActionState(addManualReadingAction, {} as ActionState);
  const copy = useMessages();

  return (
    <form action={action} className="max-w-lg space-y-4 rounded-3xl border border-sand bg-white p-5">
      <input type="hidden" name="cellId" value={cellId} />
      <FormField label={copy.forms.metric} htmlFor="metric">
        <SelectField id="metric" name="metric" defaultValue={state.values?.metric || "SOIL_MOISTURE"}>
          <option value="SOIL_MOISTURE">{copy.metric.SOIL_MOISTURE}</option>
          <option value="TEMPERATURE">{copy.metric.TEMPERATURE}</option>
          <option value="HUMIDITY">{copy.metric.HUMIDITY}</option>
          <option value="PH">{copy.metric.PH}</option>
          <option value="WATER_LEVEL">{copy.metric.WATER_LEVEL}</option>
        </SelectField>
      </FormField>
      <FormField label={copy.forms.value} htmlFor="value" hint={copy.forms.valueHint}>
        <TextInput id="value" name="value" inputMode="decimal" required defaultValue={state.values?.value ?? ""} />
      </FormField>
      <FormField label={copy.forms.notesOptional} htmlFor="notes">
        <TextArea id="notes" name="notes" defaultValue={state.values?.notes ?? ""} />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? copy.forms.saving : copy.forms.save}
      </Button>
    </form>
  );
}
