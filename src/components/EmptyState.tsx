import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  message,
  action,
  className,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-pad rounded-xl border border-dashed border-border bg-card text-center shadow-flush",
        className
      )}
    >
      {title && (
        <div className="font-display text-base text-fg">{title}</div>
      )}
      <p className={cn("text-sm text-muted", title && "mt-1")}>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
