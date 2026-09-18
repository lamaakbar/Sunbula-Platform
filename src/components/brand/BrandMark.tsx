import Image from "next/image";
import { cn } from "@/lib/cn";

const LOGO = {
  src: "/brand/sunbula-logo.png",
  width: 781,
  height: 338,
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
    ? "w-[9rem]"
    : size === "hero"
      ? "w-full max-w-[24rem]"
      : size === "sm"
        ? "w-[10rem]"
        : size === "lg"
          ? "w-[13rem]"
          : "w-[11.5rem]";

  return (
    <Image
      src={LOGO.src}
      alt={LOGO.alt}
      width={LOGO.width}
      height={LOGO.height}
      quality={100}
      unoptimized
      priority
      className={cn("h-auto rounded-xl object-contain object-left", widthClass)}
    />
  );
}
