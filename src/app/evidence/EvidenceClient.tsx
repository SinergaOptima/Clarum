"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SearchInput } from "@/components/SearchInput";
import { SectionHeader } from "@/components/SectionHeader";
import type { EvidenceListItem } from "@/data/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import { matchesQuery } from "@/lib/search";

export function EvidenceClient({ items }: { items: EvidenceListItem[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => Array.from(new Set(items.flatMap((item) => item.tags))), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesText = matchesQuery(`${item.title} ${item.summary} ${item.sourceType}`, query);
      const matchesTag = tag ? item.tags.includes(tag) : true;
      return matchesText && matchesTag;
    });
  }, [items, query, tag]);

  const chipBase =
    "rounded-full border px-3 py-1 text-xs tracking-[0.08em] uppercase transition-all duration-150 active:scale-95";

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb segments={[{ label: "Evidence" }]} />
      <ScrollReveal>
        <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
          <div className="section-label">01 Evidence library</div>
          <h1 className="mt-3 font-display text-2xl font-normal text-fg md:text-3xl">Evidence</h1>
          <p className="section-preface max-w-3xl">
            Browse source notes and trace where they are used across dossiers.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search evidence"
              ariaLabel="Search evidence"
            />
            <div className="flex items-stretch divide-x divide-border rounded-xl border border-border bg-card/80 shadow-soft text-center">
              <div className="flex-1 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Total</div>
                <div className="mt-1 font-display text-2xl text-fg">{items.length}</div>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Tags</div>
                <div className="mt-1 font-display text-2xl text-fg">{tags.length}</div>
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
        <SectionHeader title="Tag filters" subtitle="Filter by tag." className="mb-3" />
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className={`${chipBase} ${
              tag === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-fg hover:border-accent/55"
            }`}
            onClick={() => setTag(null)}
          >
            All tags
          </motion.button>
          {tags.map((item) => (
            <motion.button
              type="button"
              key={item}
              whileTap={{ scale: 0.95 }}
              className={`${chipBase} ${
                tag === item
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-fg hover:border-accent/55"
              }`}
              onClick={() => setTag(item)}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </section>

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
              message="No evidence matches the current search and filter combination. Try adjusting your query or clearing tag filters."
            />
          </motion.div>
        ) : (
          <motion.div layout className="card-grid">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <EvidenceCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-pad rounded-xl border border-border bg-card text-sm text-fg/80 shadow-flush">
        Each note links back to dossier usage so provenance is transparent.
      </div>
    </div>
  );
}
