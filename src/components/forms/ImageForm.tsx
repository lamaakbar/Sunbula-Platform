"use client";

import { useActionState } from "react";
import { uploadPlantImageAction } from "@/app/actions/images";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, TextArea } from "@/components/forms/Fields";
import { fieldClass } from "@/components/ui/Button";

export function ImageForm({ cellId }: { cellId: string }) {
  const [state, action, pending] = useActionState(uploadPlantImageAction, {} as ActionState);

  return (
    <form action={action} className="max-w-lg space-y-4 rounded-3xl border border-sand bg-white p-5">
      <input type="hidden" name="cellId" value={cellId} />
      <FormField label="Plant photo" htmlFor="image">
        <input id="image" name="image" type="file" accept="image/*" required className={fieldClass} />
      </FormField>
      <FormField label="Notes (optional)" htmlFor="notes">
        <TextArea id="notes" name="notes" />
      </FormField>
      <p className="rounded-2xl bg-sand/70 px-4 py-3 text-sm text-muted">
        If a classification appears, it is a clearly labelled demo result. No trained plant-health model is connected yet.
      </p>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Uploading…" : "Upload image"}
      </Button>
    </form>
  );
}
