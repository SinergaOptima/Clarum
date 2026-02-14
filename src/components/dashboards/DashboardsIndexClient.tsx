"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  type DashboardEntry,
  detectKnownDashboardKind,
  getKnownDashboardKindLabel,
  sortDashboards,
} from "@/data/dashboards";

function filterEntries(entries: DashboardEntry[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;
  return entries.filter((entry) => {
    const kind = detectKnownDashboardKind(entry);
    return (
      entry.name.toLowerCase().includes(normalized) ||
      String(entry.kind ?? "").toLowerCase().includes(normalized) ||
      kind.toLowerCase().includes(normalized)
    );
  });
}

export function DashboardsIndexClient({ entries }: { entries: DashboardEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterEntries(sortDashboards(entries), query), [entries, query]);
  const grouped = useMemo(() => {
    const map = new Map<string, DashboardEntry[]>();
    for (const entry of filtered) {
      const kind = detectKnownDashboardKind(entry);
      const label = getKnownDashboardKindLabel(kind);
      const existing = map.get(label) ?? [];
      existing.push(entry);
      map.set(label, existing);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <section className="stack-lg">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search dashboards by name or kind"
        ariaLabel="Search dashboards by name or kind"
      />
      {grouped.length === 0 ? (
        <p className="text-sm text-muted">No dashboards match this filter.</p>
      ) : (
        grouped.map(([group, groupEntries]) => (
          <article
            key={group}
            className="card-pad rounded-xl border border-border/90 bg-card shadow-raised"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg text-fg">{group}</h2>
              <Badge variant="neutral">{groupEntries.length}</Badge>
            </div>
            <div className="mt-4 stack-sm">
              {groupEntries.map((entry) => (
                <div
                  key={entry.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-bg/55 p-3"
                >
                  <div>
                    <div className="text-sm text-fg">{entry.name}</div>
                    <div className="text-xs text-muted">{entry.relpath}</div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboards/${encodeURIComponent(entry.name)}`}>Open</Link>
                  </Button>
                </div>
              ))}
            </div>
          </article>
        ))
      )}
    </section>
  );
}
