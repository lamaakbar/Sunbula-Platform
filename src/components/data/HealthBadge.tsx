import type { HealthStatus } from "@prisma/client";
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { healthLabel } from "@/lib/format";
import { healthTone } from "@/lib/domain/health";

const icons = {
  healthy: CheckCircle2,
  attention: AlertTriangle,
  critical: XCircle,
  unknown: HelpCircle,
};

export function HealthBadge({
  status,
  size = "md",
}: {
  status: HealthStatus;
  size?: "sm" | "md";
}) {
  const tone = healthTone(status);
  const Icon = icons[tone.icon];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        tone.bg,
        tone.border,
        tone.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      {healthLabel[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: "EMPLOYEE" | "SUPERVISOR" | "HQ" }) {
  const label = role === "HQ" ? "HQ" : role === "SUPERVISOR" ? "Supervisor" : "Employee";
  return (
    <span className="inline-flex rounded-full bg-light-sage px-2.5 py-1 text-xs font-semibold text-forest ring-1 ring-sage/40">
      {label}
    </span>
  );
}
