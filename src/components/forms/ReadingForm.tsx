"use client";

import { useActionState } from "react";
import { addManualReadingAction } from "@/app/actions/readings";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";

export function ReadingForm({ cellId }: { cellId: string }) {
  const [state, action, pending] = useActionState(addManualReadingAction, {} as ActionState);

  return (
    <form action={action} className="max-w-lg space-y-4 rounded-3xl border border-sand bg-white p-5">
      <input type="hidden" name="cellId" value={cellId} />
      <FormField label="What are you recording?" htmlFor="metric">
        <SelectField id="metric" name="metric" defaultValue="SOIL_MOISTURE">
          <option value="SOIL_MOISTURE">Soil moisture (%)</option>
          <option value="TEMPERATURE">Temperature (°C)</option>
          <option value="HUMIDITY">Humidity (%)</option>
          <option value="PH">pH</option>
          <option value="WATER_LEVEL">Water level (%)</option>
        </SelectField>
      </FormField>
      <FormField label="Value" htmlFor="value" hint="Use this only when there is no sensor reading for this cell.">
        <TextInput id="value" name="value" inputMode="decimal" required />
      </FormField>
      <FormField label="Notes (optional)" htmlFor="notes">
        <TextArea id="notes" name="notes" />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save reading"}
      </Button>
    </form>
  );
}
