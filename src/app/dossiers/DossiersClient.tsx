"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { DossierCard } from "@/components/DossierCard";
import { EmptyState } from "@/components/EmptyState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SearchInput } from "@/components/SearchInput";
import { SectionHeader } from "@/components/SectionHeader";
import type { DossierListItem } from "@/data/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import { matchesQuery } from "@/lib/search";

export function DossiersClient({ items }: { items: DossierListItem[] }) {
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<string | null>(null);

  const tracks = useMemo(() => Array.from(new Set(items.map((item) => item.trackLabel))), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesTrack = trackFilter ? item.trackLabel === trackFilter : true;
      const matchesText = matchesQuery(`${item.title} ${item.country} ${item.profileId}`, query);
      return matchesTrack && matchesText;
    });
  }, [items, query, trackFilter]);

  const resultLabel = `${filtered.length} dossier${filtered.length === 1 ? "" : "s"}`;
  const chipBase =
    "rounded-full border px-3 py-1 text-xs tracking-[0.08em] uppercase transition-all duration-150 active:scale-95";
  const filteredLabel = trackFilter ? `Track: ${trackFilter}` : "All tracks";

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb segments={[{ label: "Dossiers" }]} />
      <ScrollReveal>
        <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
          <div className="section-label">01 Dossier catalog</div>
          <h1 className="mt-3 font-display text-2xl font-normal text-fg md:text-3xl">Dossiers</h1>
          <p className="section-preface max-w-3xl">
            Search by case, country, or profile and narrow by track to compare dossiers quickly.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="stack-sm">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search dossiers"
                ariaLabel="Search dossiers"
              />
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                {resultLabel} shown - {filteredLabel}
              </div>
            </div>
            <div className="flex items-stretch divide-x divide-border rounded-xl border border-border bg-card/80 shadow-soft text-center">
              <div className="flex-1 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Total</div>
                <div className="mt-1 font-display text-2xl text-fg">{items.length}</div>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Tracks</div>
                <div className="mt-1 font-display text-2xl text-fg">{tracks.length}</div>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Visible</div>
                <div className="mt-1 font-display text-2xl text-fg">{filtered.length}</div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader
          title="Track filters"
          subtitle="Toggle one track at a time."
          className="mb-3"
        />
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className={`${chipBase} ${
              trackFilter === null
                ? "border-accent bg-accent/12 text-accent"
                : "border-border bg-card text-fg hover:border-accent/55"
            }`}
            onClick={() => setTrackFilter(null)}
          >
            All tracks
          </motion.button>
          {tracks.map((track) => (
            <motion.button
              type="button"
              key={track}
              whileTap={{ scale: 0.95 }}
              className={`${chipBase} ${
                trackFilter === track
                  ? "border-accent bg-accent/12 text-accent"
                  : "border-border bg-card text-fg hover:border-accent/55"
              }`}
              onClick={() => setTrackFilter(track)}
            >
              {track}
            </motion.button>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-border/90 bg-card px-5 py-4 shadow-flush">
        <div className="text-xs uppercase tracking-[0.1em] text-muted">Reading dossier cards</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-fg/90">Confidence — evidence-backed reliability</div>
            <div className="mt-2 h-2 rounded-full" style={{ background: "linear-gradient(to right, rgb(174 74 76), rgb(186 116 58), rgb(34 132 98))" }} />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-fg/90">Completeness — indicator coverage</div>
            <div className="mt-2 h-2 rounded-full" style={{ background: "linear-gradient(to right, rgb(174 74 76), rgb(186 116 58), rgb(42 138 148))" }} />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>Sparse</span>
              <span>Partial</span>
              <span>Full</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <EmptyState
              title="No matches"
              message="No dossiers match the current search and filter combination. Try adjusting your query or clearing filters."
            />
          </motion.div>
        ) : (
          <motion.div layout className="card-grid">
            {filtered.map((item) => (
              <motion.div
                key={item.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <DossierCard dossier={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-pad rounded-xl border border-border bg-card text-sm text-fg/80 shadow-flush">
        Compare tracks and profiles quickly, then drill into domain-level indicators.
      </div>
    </div>
  );
}
