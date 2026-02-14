"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DossierCard } from "@/components/DossierCard";
import { EmptyState } from "@/components/EmptyState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SearchInput } from "@/components/SearchInput";
import { SectionHeader } from "@/components/SectionHeader";
import {
  TRACK_FILTER_ORDER,
  TRACK_GROUP_ORDER,
  type TrackKey,
  deriveTrackFromReportId,
  getTrackDescription,
  getTrackLabel,
  getTrackSlug,
  parseTrackFromSearchParam,
  normalizeTrack,
} from "@/data/track";
import type { DossierListItem } from "@/data/types";
import { Breadcrumb } from "@/components/Breadcrumb";
import { matchesQuery } from "@/lib/search";

export function DossiersClient({ items }: { items: DossierListItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isScenarioPanelOpen, setIsScenarioPanelOpen] = useState(false);

  const normalizedItems = useMemo(
    () =>
      items.map((item) => {
        const trackFromId = deriveTrackFromReportId(item.id);
        const track = trackFromId === "other" ? normalizeTrack(item.track) : trackFromId;
        return {
          ...item,
          track,
          trackKey: track,
          trackLabel: getTrackLabel(track),
          scenarioKey: track,
        };
      }),
    [items]
  );

  const selectedTrack = useMemo(
    () => parseTrackFromSearchParam(searchParams.get("track")),
    [searchParams]
  );

  useEffect(() => {
    setIsScenarioPanelOpen(false);
  }, [selectedTrack]);

  const countsByTrack = useMemo(() => {
    const counts = new Map<TrackKey, number>();
    for (const track of TRACK_FILTER_ORDER) counts.set(track, 0);
    for (const item of normalizedItems) {
      counts.set(item.trackKey, (counts.get(item.trackKey) ?? 0) + 1);
    }
    return counts;
  }, [normalizedItems]);

  const tracksPresent = useMemo(
    () => new Set(normalizedItems.map((item) => item.trackKey)),
    [normalizedItems]
  );

  const filterTracks = useMemo(
    () => TRACK_FILTER_ORDER.filter((track) => track !== "other" || tracksPresent.has("other")),
    [tracksPresent]
  );

  const textFiltered = useMemo(() => {
    return normalizedItems.filter((item) => {
      const matchesText = matchesQuery(`${item.title} ${item.country} ${item.profileId}`, query);
      return matchesText;
    });
  }, [normalizedItems, query]);

  const groupedByTrack = useMemo(() => {
    const groups = new Map<TrackKey, typeof textFiltered>();
    for (const track of TRACK_GROUP_ORDER) groups.set(track, []);
    for (const item of textFiltered) {
      const group = groups.get(item.trackKey);
      if (group) group.push(item);
    }
    return groups;
  }, [textFiltered]);

  const groupedSections = useMemo(
    () =>
      TRACK_GROUP_ORDER.map((track) => ({
        track,
        items: groupedByTrack.get(track) ?? [],
      })).filter((section) => section.items.length > 0),
    [groupedByTrack]
  );

  const visible = useMemo(() => {
    if (!selectedTrack) return textFiltered;
    return textFiltered.filter((item) => item.trackKey === selectedTrack);
  }, [textFiltered, selectedTrack]);

  const resultLabel = `${visible.length} dossier${visible.length === 1 ? "" : "s"}`;
  const chipBase =
    "rounded-full border px-3 py-1 text-xs tracking-[0.08em] uppercase transition-all duration-150 active:scale-95";
  const filteredLabel = selectedTrack ? `Scenario: ${getTrackLabel(selectedTrack)}` : "All scenarios";
  const selectedTrackCount = selectedTrack ? countsByTrack.get(selectedTrack) ?? 0 : 0;

  const setTrackFilter = (track: TrackKey | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (track) {
      params.set("track", getTrackSlug(track));
    } else {
      params.delete("track");
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

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
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Scenarios</div>
                <div className="mt-1 font-display text-2xl text-fg">{tracksPresent.size}</div>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">Visible</div>
                <div className="mt-1 font-display text-2xl text-fg">{visible.length}</div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader
          title="Scenario Filters"
          subtitle="Toggle one scenario lens at a time."
          className="mb-3"
        />
        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className={`${chipBase} ${
              selectedTrack === null
                ? "border-accent bg-accent/12 text-accent"
                : "border-border bg-card text-fg hover:border-accent/55"
            }`}
            onClick={() => setTrackFilter(null)}
          >
            All
          </motion.button>
          {filterTracks.map((track) => (
            <motion.button
              type="button"
              key={track}
              whileTap={{ scale: 0.95 }}
              className={`${chipBase} ${
                selectedTrack === track
                  ? "border-accent bg-accent/12 text-accent"
                  : "border-border bg-card text-fg hover:border-accent/55"
              }`}
              onClick={() => setTrackFilter(track)}
            >
              {getTrackLabel(track)}
            </motion.button>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border/80 bg-bg/55 p-3 shadow-flush">
          {!selectedTrack ? (
            <div className="text-xs text-muted">Browse by scenario to compare lenses.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs uppercase tracking-[0.14em] text-muted">
                  {getTrackLabel(selectedTrack)}
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs tracking-[0.08em] uppercase text-fg transition hover:border-accent/55"
                  onClick={() => setIsScenarioPanelOpen((prev) => !prev)}
                >
                  About this scenario
                </motion.button>
              </div>
              <AnimatePresence initial={false}>
                {isScenarioPanelOpen ? (
                  <motion.div
                    key="scenario-panel"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-3 rounded-lg border border-border/70 bg-card/80 p-3"
                  >
                    <p className="text-sm leading-relaxed text-fg/85">
                      {getTrackDescription(selectedTrack)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.12em] text-muted">
                      <span>{selectedTrackCount} dossiers</span>
                      <Link href="/scenarios" className="link-accent hover:underline">
                        See all scenarios
                      </Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          )}
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
        {visible.length === 0 ? (
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
        ) : selectedTrack ? (
          <motion.div layout className="card-grid">
            {visible.map((item) => (
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
        ) : (
          <motion.div layout className="stack-lg">
            {groupedSections.map((section) => (
              <section
                key={section.track}
                className="card-pad rounded-xl border border-border/90 bg-card shadow-raised"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-display text-xl text-fg">{getTrackLabel(section.track)}</h2>
                    <span className="text-xs uppercase tracking-[0.12em] text-muted">
                      ({section.items.length})
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    className="rounded-full border border-border bg-bg/70 px-3 py-1 text-xs uppercase tracking-[0.1em] text-fg transition hover:border-accent/55"
                    onClick={() => setTrackFilter(section.track)}
                  >
                    View all
                  </motion.button>
                </div>
                <div className="card-grid">
                  {section.items.map((item) => (
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
                </div>
              </section>
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
