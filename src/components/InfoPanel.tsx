import { cn } from "@/lib/cn";

export function InfoPanel({
  title,
  body,
  elevation = "flush",
  className,
}: {
  title: string;
  body: string;
  elevation?: "flush" | "raised" | "floating";
  className?: string;
}) {
  const elevationClass =
    elevation === "floating"
      ? "surface-floating"
      : elevation === "raised"
        ? "surface-raised"
        : "surface-flush";

  return (
    <div
      className={cn(
        "info-panel card-pad rounded-lg border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-raised",
        elevationClass,
        className
      )}
    >
      <div className="text-xs uppercase tracking-[0.2em] text-muted">{title}</div>
      <div className="mt-2 text-sm text-fg/80">{body}</div>
    </div>
  );
}
