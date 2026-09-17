"use client";

import { useActionState, useState } from "react";
import { Droplets, Leaf, ScanSearch, Sprout, Plus } from "lucide-react";
import { logOperationAction, type ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { FormField, TextArea, TextInput } from "@/components/forms/Fields";
import { cn } from "@/lib/cn";
import type { OperationType } from "@prisma/client";

const options: Array<{ type: OperationType; label: string; hint: string; icon: typeof Droplets }> = [
  { type: "IRRIGATION", label: "Irrigation", hint: "Water this cell", icon: Droplets },
  { type: "FERTILIZATION", label: "Fertilization", hint: "Log nutrients", icon: Leaf },
  { type: "REPLANTING", label: "Replanting", hint: "Move or replace", icon: Sprout },
  { type: "INSPECTION", label: "Inspection", hint: "Visual check", icon: ScanSearch },
  { type: "OTHER", label: "Other", hint: "Something else", icon: Plus },
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
  const selected = options.find((item) => item.type === type)!;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="cellId" value={cellId} />
      <input type="hidden" name="type" value={type} />
      {taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-leaf">Log operation</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {options.map((item) => {
            const Icon = item.icon;
            const active = item.type === type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setType(item.type)}
                className={cn(
                  "rounded-[1.5rem] border p-4 text-left transition",
                  active ? "border-forest bg-light-sage shadow-[0_10px_24px_-18px_rgba(14,45,30,0.55)]" : "border-sand bg-white hover:border-leaf",
                )}
              >
                <Icon className="h-6 w-6 text-forest" />
                <p className="mt-3 font-semibold text-forest">{item.label}</p>
                <p className="mt-1 text-xs text-muted">{item.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-sand bg-white p-5">
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Plant</dt>
            <dd className="font-semibold">{cellCode}</dd>
          </div>
          <div>
            <dt className="text-muted">Zone</dt>
            <dd className="font-semibold">{zoneName}</dd>
          </div>
          <div>
            <dt className="text-muted">Time</dt>
            <dd className="font-semibold">Now</dd>
          </div>
        </dl>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="Amount (optional)" htmlFor="amount">
            <TextInput id="amount" name="amount" inputMode="decimal" placeholder="e.g. 4" />
          </FormField>
          <FormField label="Unit (optional)" htmlFor="unit">
            <TextInput id="unit" name="unit" placeholder="litres" />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Notes (optional)" htmlFor="notes">
            <TextArea id="notes" name="notes" placeholder="Anything the next person should know" />
          </FormField>
        </div>
      </div>

      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving…" : `Complete ${selected.label.toLowerCase()}`}
      </Button>
    </form>
  );
}
