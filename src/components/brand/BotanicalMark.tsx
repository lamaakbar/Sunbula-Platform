import { cn } from "@/lib/cn";

export function BotanicalMark({
  className,
  variant = "sprout",
}: {
  className?: string;
  variant?: "sprout" | "canopy" | "seed";
}) {
  if (variant === "canopy") {
    return (
      <svg viewBox="0 0 160 160" fill="none" className={cn("text-sage", className)} aria-hidden>
        <path d="M80 140V62" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M80 86c-28-26-56-28-70-20 14 32 42 50 70 56" fill="currentColor" opacity="0.55" />
        <path d="M80 78c28-30 56-32 70-22-14 34-42 52-70 58" fill="currentColor" />
      </svg>
    );
  }

  if (variant === "seed") {
    return (
      <svg viewBox="0 0 120 120" fill="none" className={cn("text-leaf", className)} aria-hidden>
        <ellipse cx="60" cy="62" rx="22" ry="30" fill="currentColor" opacity="0.2" />
        <path d="M60 88c-16-20-8-42 0-52 8 10 16 32 0 52z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 160" fill="none" className={cn("text-sage", className)} aria-hidden>
      <path d="M82 138V58" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M82 92C54 62 28 56 16 62c12 34 38 52 66 56" fill="currentColor" opacity="0.45" />
      <path d="M82 84c26-32 54-36 68-26-12 36-40 54-68 60" fill="currentColor" />
      <circle cx="82" cy="48" r="10" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[clamp(1.25rem,2vw,1.55rem)] font-semibold text-forest">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
