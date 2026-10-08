"use client";

import { useActionState } from "react";
import { reviewRequestAction } from "@/app/actions/management";
import type { ActionState } from "@/app/actions/operations";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/forms/Fields";
import { useMessages } from "@/components/i18n/LocaleProvider";

export function ReviewActions({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(reviewRequestAction, {} as ActionState);
  const copy = useMessages();
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <TextArea name="reviewNotes" placeholder={copy.forms.reviewNotes} />
      {state.error ? <p className="text-sm text-critical">{state.error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="status" value="UNDER_REVIEW" variant="sand" disabled={pending}>
          {copy.forms.underReview}
        </Button>
        <Button type="submit" name="status" value="APPROVED" disabled={pending}>
          {copy.forms.approve}
        </Button>
        <Button type="submit" name="status" value="REJECTED" variant="danger" disabled={pending}>
          {copy.forms.reject}
        </Button>
      </div>
    </form>
  );
}
