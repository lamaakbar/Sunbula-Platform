"use client";

import { useActionState } from "react";
import { updateInventoryAction } from "@/app/actions/management";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function InventoryRowForm({
  inventoryId,
  quantity,
}: {
  inventoryId: string;
  quantity: number;
}) {
  const [state, action, pending] = useActionState(updateInventoryAction, {} as ActionState);
  const copy = useMessages();

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="inventoryId" value={inventoryId} />
      <TextInput name="quantity" type="number" min={0} defaultValue={quantity} className="w-28 py-2" />
      <Button type="submit" size="sm" disabled={pending}>
        {copy.forms.save}
      </Button>
      {state.error ? <span className="text-xs text-critical">{state.error}</span> : null}
    </form>
  );
}
