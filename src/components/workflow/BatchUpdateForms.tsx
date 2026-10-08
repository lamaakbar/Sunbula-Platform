"use client";

import { useActionState } from "react";
import { resubmitBatchUpdateAction, reviewBatchUpdateAction, submitBatchUpdateAction } from "@/app/actions/batch-updates";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";
import type { workflowCopy } from "@/lib/workflow-copy";

type Copy = ReturnType<typeof workflowCopy>;

const stages = ["SEEDLING", "GROWING", "READY", "DISTRIBUTED"] as const;

export function BatchUpdateForm({
  batches,
  copy,
}: {
  batches: Array<{ id: string; code: string; species: string; quantity: number; stage: string }>;
  copy: Copy;
}) {
  const [state, action, pending] = useActionState(submitBatchUpdateAction, {} as ActionState);
  const values = state.values ?? {};
  const ui = useMessages();
  return (
    <form action={action} className="space-y-4">
      <FormField label={copy.batch} htmlFor="batchId">
        <SelectField id="batchId" name="batchId" required defaultValue={values.batchId}>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.code} · {batch.species} · {batch.quantity} · {ui.growth[batch.stage as keyof typeof ui.growth]}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label={copy.quantity} htmlFor="quantity">
        <TextInput id="quantity" name="quantity" type="number" min={1} required defaultValue={values.quantity} />
      </FormField>
      <FormField label={copy.stage} htmlFor="growthStage">
        <SelectField id="growthStage" name="growthStage" defaultValue={values.growthStage || "GROWING"}>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {ui.growth[stage]}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label={copy.notes} htmlFor="notes">
        <TextArea id="notes" name="notes" required defaultValue={values.notes} />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" disabled={pending || batches.length === 0}>
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}

export function ResubmitForm({
  updateId,
  batchId,
  quantity,
  stage,
  notes,
  copy,
}: {
  updateId: string;
  batchId: string;
  quantity: number;
  stage: string;
  notes: string;
  copy: Copy;
}) {
  const [state, action, pending] = useActionState(resubmitBatchUpdateAction, {} as ActionState);
  const values = state.values ?? {};
  const ui = useMessages();
  return (
    <form action={action} className="mt-4 space-y-4 border-t border-sand pt-4">
      <input type="hidden" name="updateId" value={updateId} />
      <input type="hidden" name="batchId" value={batchId} />
      <FormField label={copy.quantity} htmlFor={`quantity-${updateId}`}>
        <TextInput
          id={`quantity-${updateId}`}
          name="quantity"
          type="number"
          min={1}
          required
          defaultValue={values.quantity || String(quantity)}
        />
      </FormField>
      <FormField label={copy.stage} htmlFor={`stage-${updateId}`}>
        <SelectField id={`stage-${updateId}`} name="growthStage" defaultValue={values.growthStage || stage}>
          {stages.map((item) => (
            <option key={item} value={item}>
              {ui.growth[item]}
            </option>
          ))}
        </SelectField>
      </FormField>
      <FormField label={copy.notes} htmlFor={`notes-${updateId}`}>
        <TextArea id={`notes-${updateId}`} name="notes" required defaultValue={values.notes || notes} />
      </FormField>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? copy.resubmitting : copy.resubmit}
      </Button>
    </form>
  );
}

export function ReviewForm({ updateId, copy }: { updateId: string; copy: Copy }) {
  const [state, action, pending] = useActionState(reviewBatchUpdateAction, {} as ActionState);
  return (
    <form action={action} className="mt-4 space-y-3 border-t border-sand pt-4">
      <input type="hidden" name="updateId" value={updateId} />
      <FormField label={copy.feedback} htmlFor={`feedback-${updateId}`} hint={copy.feedbackHint}>
        <TextArea id={`feedback-${updateId}`} name="feedback" defaultValue={state.values?.feedback} />
      </FormField>
      <p className="text-xs text-muted">{copy.tasksUntouched}</p>
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <div className="flex flex-col gap-2">
        <Button type="submit" name="decision" value="approve" disabled={pending}>
          {pending ? copy.reviewing : copy.approve}
        </Button>
        <Button type="submit" name="decision" value="revise" variant="sand" disabled={pending}>
          {copy.revise}
        </Button>
        <Button type="submit" name="decision" value="reject" variant="danger" disabled={pending}>
          {copy.reject}
        </Button>
      </div>
    </form>
  );
}
