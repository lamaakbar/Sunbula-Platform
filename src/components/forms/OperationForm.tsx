"use client";

import { useActionState, useState } from "react";
import { Droplets, Leaf, ScanSearch, Sprout, Plus } from "lucide-react";
import { logOperationAction, type ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, TextArea, TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import type { OperationType } from "@prisma/client";

const optionTypes: Array<{ type: OperationType; icon: typeof Droplets }> = [
  { type: "IRRIGATION", icon: Droplets },
  { type: "FERTILIZATION", icon: Leaf },
  { type: "REPLANTING", icon: Sprout },
  { type: "INSPECTION", icon: ScanSearch },
  { type: "OTHER", icon: Plus },
];

export function OperationForm({
  cellId,
  cellCode,
  zoneName,
  defaultType,
  taskId,
}: {
  cellId: string;
  cellCode: string;
  zoneName: string;
  defaultType?: OperationType;
  taskId?: string;
}) {
  const [type, setType] = useState<OperationType>(defaultType ?? "IRRIGATION");
  const [state, action, pending] = useActionState(logOperationAction, {} as ActionState);
  const copy = useMessages();

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="cellId" value={cellId} />
      <input type="hidden" name="type" value={type} />
      {taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-leaf">{copy.employee.logOp}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {optionTypes.map((item) => {
            const Icon = item.icon;
            const active = item.type === type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setType(item.type)}
                className={cn(
                  "rounded-[1.5rem] border p-4 text-start transition",
                  active ? "border-forest bg-light-sage shadow-[0_10px_24px_-18px_rgba(14,45,30,0.55)]" : "border-sand bg-white hover:border-leaf",
                )}
              >
                <Icon className="h-6 w-6 text-forest" />
                <p className="mt-3 font-semibold text-forest">{copy.operation[item.type]}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-sand bg-white p-5">
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">{copy.forms.cell}</dt>
            <dd className="font-semibold">{cellCode}</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.forms.zone}</dt>
            <dd className="font-semibold">{zoneName}</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.time.justNow}</dt>
            <dd className="font-semibold">{copy.time.justNow}</dd>
          </div>
        </dl>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label={copy.forms.amount} htmlFor="amount">
            <TextInput id="amount" name="amount" inputMode="decimal" placeholder="e.g. 4" />
          </FormField>
          <FormField label={copy.forms.unit} htmlFor="unit">
            <TextInput id="unit" name="unit" placeholder="litres" />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label={copy.forms.notesOptional} htmlFor="notes">
            <TextArea id="notes" name="notes" placeholder="Anything the next person should know" />
          </FormField>
        </div>
      </div>

      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? copy.forms.saving : copy.operation[type]}
      </Button>
    </form>
  );
}
