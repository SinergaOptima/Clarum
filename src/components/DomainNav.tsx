import type { Domain } from "@/data/types";
import { cn } from "@/lib/cn";

export function DomainNav({ domains, className }: { domains: Domain[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {domains.map((domain) => (
        <a
          key={domain.id}
          href={`#${domain.id}`}
          className="rounded-full border border-border bg-bg/60 px-3 py-1 text-xs tracking-[0.08em] text-fg transition hover:border-accent hover:bg-accent/10"
        >
          {domain.id} · {domain.name}
        </a>
      ))}
    </div>
  );
}
