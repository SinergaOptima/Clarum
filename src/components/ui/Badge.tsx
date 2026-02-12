import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "good" | "warn" | "danger";
};

const variants = {
  neutral: "bg-border/40 text-fg border-border/60",
  good: "bg-good/15 text-good/90 border-good/25",
  warn: "bg-warn/15 text-warn/90 border-warn/25",
  danger: "bg-danger/15 text-danger/90 border-danger/25",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(18,22,30,0.06)]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
