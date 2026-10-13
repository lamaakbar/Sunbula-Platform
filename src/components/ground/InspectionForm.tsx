import { recordInspectionAction } from "@/app/actions/inspections";
import { Button, fieldClass } from "@/components/ui/Button";
import type { groundCopy } from "@/lib/ground-copy";

export function InspectionForm({
  cellId,
  returnTo,
  copy,
  statusLabels,
}: {
  cellId: string;
  returnTo: string;
  copy: ReturnType<typeof groundCopy>;
  statusLabels: { status: string; healthy: string; attention: string; critical: string };
}) {
  return (
    <form action={recordInspectionAction} className="rounded-[1.7rem] bg-white p-5 ring-1 ring-sand">
      <input type="hidden" name="cellId" value={cellId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <h2 className="text-lg font-semibold text-forest">{copy.record}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.suspicion}</p>
      <div className="mt-4 grid gap-3">
        <label className="text-sm font-semibold text-forest">
          {statusLabels.status}
          <select name="status" defaultValue="HEALTHY" className={`${fieldClass} mt-1`}>
            <option value="HEALTHY">{statusLabels.healthy}</option>
            <option value="ATTENTION">{statusLabels.attention}</option>
            <option value="CRITICAL">{statusLabels.critical}</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-forest">
          {copy.symptom}
          <select name="symptom" defaultValue="" className={`${fieldClass} mt-1`}>
            <option value="">—</option>
            <option value="WILT">{copy.wilt}</option>
            <option value="SPOTS">{copy.spots}</option>
            <option value="COLOR">{copy.color}</option>
            <option value="PEST">{copy.pest}</option>
            <option value="OTHER">{copy.other}</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-forest">
          {copy.extent}
          <select name="extent" defaultValue="CELL" className={`${fieldClass} mt-1`}>
            <option value="CELL">{copy.thisCell}</option>
            <option value="NEARBY">{copy.nearby}</option>
            <option value="ZONE">{copy.wider}</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-forest">
          {copy.notes}
          <textarea name="notes" rows={3} className={`${fieldClass} mt-1`} />
        </label>
        <Button type="submit">{copy.record}</Button>
      </div>
    </form>
  );
}
