import Image from "next/image";
import { cn } from "@/lib/cn";

const LOGO = {
  src: "/brand/sunbula-logo.png",
  width: 1562,
  height: 451,
  alt: "سنبلة SUNBULA",
} as const;

export function BrandMark({
  compact = false,
  size = "md",
}: {
  compact?: boolean;
  light?: boolean;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  const widthClass = compact
    ? "w-[10rem]"
    : size === "hero"
      ? "w-full max-w-[28rem]"
      : size === "sm"
        ? "w-[11rem]"
        : size === "lg"
          ? "w-[14.5rem]"
          : "w-[13rem]";

  return (
    <Image
      src={LOGO.src}
      alt={LOGO.alt}
      width={LOGO.width}
      height={LOGO.height}
      quality={100}
      unoptimized
      priority
      className={cn("h-auto object-contain object-left", widthClass)}
    />
  );
}
