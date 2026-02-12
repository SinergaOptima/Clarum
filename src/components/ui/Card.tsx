import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: "flush" | "raised" | "floating";
};

const elevationMap = {
  flush: "surface-flush",
  raised: "surface-raised",
  floating: "surface-floating",
};

export function Card({ className, elevation = "raised", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "card-surface card-pad rounded-xl border border-border bg-card",
        elevationMap[elevation],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex items-start justify-between", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-lg font-semibold", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-fg/80", className)} {...props} />;
}
