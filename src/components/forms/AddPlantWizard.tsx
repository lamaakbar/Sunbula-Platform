"use client";

import { useActionState, useState } from "react";
import { addPlantBatchAction } from "@/app/actions/plants";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, SelectField, TextArea, TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

type CellOption = { id: string; code: string };
type SpeciesOption = { id: string; commonName: string };

export function AddPlantWizard({
  nurseryName,
  zoneName,
  species,
  cells,
}: {
  nurseryName: string;
  zoneName: string;
  species: SpeciesOption[];
  cells: CellOption[];
}) {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<"PLANT" | "BATCH">("PLANT");
  const [state, action, pending] = useActionState(addPlantBatchAction, {} as ActionState);
  const copy = useMessages();

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (step !== 5) event.preventDefault();
      }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <input type="hidden" name="kind" value={kind} />
      <ol className="flex gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {[1, 2, 3, 4, 5].map((item) => (
          <li key={item} className={cn("rounded-full px-3 py-1", item === step ? "bg-forest text-white" : "bg-sand")}>
            {item}
          </li>
        ))}
      </ol>

      <section className={cn("grid gap-3 sm:grid-cols-2", step !== 1 && "hidden")}>
          <button type="button" onClick={() => setKind("PLANT")} className={cn("rounded-3xl border p-6 text-start", kind === "PLANT" ? "border-forest bg-light-sage" : "border-sand bg-white")}>
            <p className="text-xl font-semibold text-forest">{copy.forms.cell}</p>
            <p className="mt-2 text-sm text-muted">{copy.employee.addLead}</p>
          </button>
          <button type="button" onClick={() => setKind("BATCH")} className={cn("rounded-3xl border p-6 text-start", kind === "BATCH" ? "border-forest bg-light-sage" : "border-sand bg-white")}>
            <p className="text-xl font-semibold text-forest">{copy.employee.batch}</p>
            <p className="mt-2 text-sm text-muted">{copy.employee.quantity}</p>
          </button>
        </section>

      <section className={cn("space-y-4 rounded-3xl border border-sand bg-white p-5", step !== 2 && "hidden")}>
          <FormField label={copy.forms.species} htmlFor="speciesId">
            <SelectField id="speciesId" name="speciesId" required>
              {species.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.commonName}
                </option>
              ))}
            </SelectField>
          </FormField>
          <FormField label={copy.forms.quantity} htmlFor="quantity">
            <TextInput id="quantity" name="quantity" type="number" min={1} defaultValue={kind === "PLANT" ? 1 : 50} required />
          </FormField>
          <FormField label={copy.forms.source} htmlFor="source">
            <TextInput id="source" name="source" defaultValue="Nursery stock" required />
          </FormField>
          <FormField label={copy.forms.planting} htmlFor="plantingDate">
            <TextInput id="plantingDate" name="plantingDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
          </FormField>
        </section>

      <section className={cn("space-y-4 rounded-3xl border border-sand bg-white p-5", step !== 3 && "hidden")}>
          <FormField label={copy.forms.nursery}>
            <TextInput readOnly value={nurseryName} />
          </FormField>
          <FormField label={copy.forms.zone}>
            <TextInput readOnly value={zoneName} />
          </FormField>
          <FormField label={copy.forms.cell} htmlFor="cellId">
            <SelectField id="cellId" name="cellId" required>
              {cells.map((cell) => (
                <option key={cell.id} value={cell.id}>
                  {cell.code}
                </option>
              ))}
            </SelectField>
          </FormField>
        </section>

      <section className={cn("space-y-4 rounded-3xl border border-sand bg-white p-5", step !== 4 && "hidden")}>
          <FormField label={copy.forms.stage} htmlFor="growthStage">
            <SelectField id="growthStage" name="growthStage" defaultValue="SEEDLING">
              <option value="SEEDLING">{copy.growth.SEEDLING}</option>
              <option value="GROWING">{copy.growth.GROWING}</option>
              <option value="READY">{copy.growth.READY}</option>
            </SelectField>
          </FormField>
          <FormField label={copy.forms.health} htmlFor="healthStatus">
            <SelectField id="healthStatus" name="healthStatus" defaultValue="HEALTHY">
              <option value="HEALTHY">{copy.health.HEALTHY}</option>
              <option value="ATTENTION">{copy.health.ATTENTION}</option>
              <option value="CRITICAL">{copy.health.CRITICAL}</option>
            </SelectField>
          </FormField>
          <FormField label={copy.forms.notesOptional} htmlFor="notes">
            <TextArea id="notes" name="notes" />
          </FormField>
        </section>

      <section className={cn("rounded-3xl border border-sand bg-white p-5", step !== 5 && "hidden")}>
          <p className="text-lg font-semibold text-forest">{copy.common.review}</p>
          <p className="mt-2 text-sm text-muted">
            Adding a {kind === "PLANT" ? "plant" : "seedling batch"} to {zoneName}. Age will be calculated from the planting date.
          </p>
          {state.error ? <p className="mt-4 text-sm text-critical">{state.error}</p> : null}
          <Button type="submit" size="lg" className="mt-6" disabled={pending}>
            {pending ? "Saving…" : "Add to zone"}
          </Button>
        </section>

      {step < 5 ? (
        <div className="flex gap-3">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep((value) => value - 1)}>
              Back
            </Button>
          ) : null}
          <Button onClick={() => setStep((value) => value + 1)}>Continue</Button>
        </div>
      ) : null}
    </form>
  );
}
