import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "sand";
  size?: "md" | "lg" | "sm";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        size === "lg" && "min-h-14 px-6 text-base",
        size === "md" && "min-h-12 px-5 text-sm",
        size === "sm" && "min-h-10 px-4 text-sm",
        variant === "primary" && "bg-forest text-white shadow-[0_10px_20px_-12px_rgba(14,45,30,0.7)] hover:bg-deep",
        variant === "secondary" && "border border-sage bg-white text-forest hover:bg-light-sage",
        variant === "ghost" && "text-forest hover:bg-light-sage",
        variant === "danger" && "bg-critical text-white hover:bg-critical/90",
        variant === "sand" && "bg-sand text-forest hover:bg-light-sage",
        className,
      )}
      {...props}
    />
  );
}

export const fieldClass =
  "w-full rounded-2xl border border-sand bg-cream/40 px-4 py-3.5 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-leaf focus:bg-white focus:ring-2 focus:ring-sage/50";
