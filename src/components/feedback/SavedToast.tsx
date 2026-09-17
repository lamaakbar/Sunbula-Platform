"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const MESSAGES: Record<string, string> = {
  operation: "Operation recorded successfully.",
  reading: "Reading saved.",
  plant: "Plant successfully added.",
  image: "Plant image uploaded.",
  inventory: "Inventory updated.",
  request: "Request submitted to HQ.",
  review: "Request updated.",
  task: "Task assigned.",
  target: "Production target saved.",
};

export function SavedToast({ value }: { value?: string }) {
  const message = value ? MESSAGES[value] : undefined;
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (!value || !MESSAGES[value]) return;
    const timer = window.setTimeout(() => setDismissed(value), 4200);
    return () => window.clearTimeout(timer);
  }, [value]);

  if (!message || dismissed === value) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-medium text-white shadow-lg">
        <CheckCircle2 className="h-5 w-5 text-sage" />
        {message}
      </div>
    </div>
  );
}
