import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-border/40",
        className
      )}
    />
  );
}

export function DossierCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/90 bg-card/95 shadow-raised">
      <div className="card-pad mb-0 border-b border-border/70 bg-gradient-to-br from-accent/10 to-transparent">
        <div className="stack-sm">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
        </div>
      </div>
      <div className="stack-md card-pad flex-1">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card-pad-tight rounded-lg border border-border/80 bg-bg/60">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 mt-1" />
            <Skeleton className="h-1.5 w-full mt-2" />
          </div>
          <div className="card-pad-tight rounded-lg border border-border/80 bg-bg/60">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 mt-1" />
            <Skeleton className="h-1.5 w-full mt-2" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export function EvidenceCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-raised">
      <div className="card-pad mb-0 border-b border-border/70 bg-gradient-to-br from-accent2/10 to-transparent">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-32 mt-1" />
        <Skeleton className="h-6 w-24 mt-2" />
      </div>
      <div className="stack-md card-pad">
        <Skeleton className="h-16 w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}
