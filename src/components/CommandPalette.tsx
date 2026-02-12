"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { getAllDossiers, getAllEvidenceList } from "@/data/loaders";
import type { DossierListItem, EvidenceListItem } from "@/data/types";
import { matchesQuery } from "@/lib/search";

let cachedDossiers: DossierListItem[] | null = null;
let cachedEvidence: EvidenceListItem[] | null = null;
let cachedPromise: Promise<void> | null = null;

type PaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  section: "Navigation" | "Dossiers" | "Evidence";
  action: () => void;
};

async function loadIndexData() {
  if (!cachedPromise) {
    cachedPromise = Promise.all([getAllDossiers(), getAllEvidenceList()]).then(
      ([dossiers, evidence]) => {
        cachedDossiers = dossiers;
        cachedEvidence = evidence;
      }
    );
  }
  await cachedPromise;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);
  const [dossierItems, setDossierItems] = useState<DossierListItem[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);
  const listboxId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCommand) {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (cachedDossiers && cachedEvidence) {
      setDossierItems(cachedDossiers);
      setEvidenceItems(cachedEvidence);
      return;
    }
    let isActive = true;
    setIsLoading(true);
    loadIndexData()
      .then(() => {
        if (!isActive) return;
        setDossierItems(cachedDossiers ?? []);
        setEvidenceItems(cachedEvidence ?? []);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [open]);

  const navCommands = useMemo<PaletteItem[]>(
    () => [
      {
        id: "nav-home",
        title: "Home",
        subtitle: "Overview and featured dossiers",
        section: "Navigation",
        action: () => router.push("/"),
      },
      {
        id: "nav-dossiers",
        title: "Dossiers",
        subtitle: "Catalog and filters",
        section: "Navigation",
        action: () => router.push("/dossiers"),
      },
      {
        id: "nav-evidence",
        title: "Evidence",
        subtitle: "Source notes and backlinks",
        section: "Navigation",
        action: () => router.push("/evidence"),
      },
      {
        id: "nav-methodology",
        title: "Methodology",
        subtitle: "Scoring and evidence gates",
        section: "Navigation",
        action: () => router.push("/methodology"),
      },
      {
        id: "nav-costs",
        title: "Costs",
        subtitle: "Plans and licensing",
        section: "Navigation",
        action: () => router.push("/costs"),
      },
      {
        id: "nav-about",
        title: "About",
        subtitle: "Platform context",
        section: "Navigation",
        action: () => router.push("/about"),
      },
    ],
    [router]
  );

  const filteredNav = useMemo(
    () =>
      navCommands.filter((item) =>
        matchesQuery(`${item.title} ${item.subtitle ?? ""}`, deferredQuery)
      ),
    [navCommands, deferredQuery]
  );

  const filteredDossiers = useMemo<PaletteItem[]>(() => {
    const items = deferredQuery
      ? dossierItems.filter((item) =>
          matchesQuery(
            `Dossier ${item.title} ${item.trackLabel} ${item.country} ${item.profileId}`,
            deferredQuery
          )
        )
      : dossierItems;
    return items.slice(0, 10).map((item) => ({
      id: `dossier-${item.slug}`,
      title: item.title,
      subtitle: `${item.country} · ${item.trackLabel} · ${item.profileId}`,
      section: "Dossiers" as const,
      action: () => router.push(`/dossiers/${item.slug}`),
    }));
  }, [dossierItems, deferredQuery, router]);

  const filteredEvidence = useMemo<PaletteItem[]>(() => {
    const items = deferredQuery
      ? evidenceItems.filter((item) =>
          matchesQuery(`Evidence ${item.title} ${item.sourceType}`, deferredQuery)
        )
      : evidenceItems;
    return items.slice(0, 10).map((item) => ({
      id: `evidence-${item.id}`,
      title: item.title,
      subtitle: item.sourceType,
      section: "Evidence" as const,
      action: () => router.push(`/evidence/${item.id}`),
    }));
  }, [evidenceItems, deferredQuery, router]);

  const sections = useMemo(
    () => [
      { title: "Navigation", items: filteredNav },
      { title: "Dossiers", items: filteredDossiers },
      { title: "Evidence", items: filteredEvidence },
    ],
    [filteredNav, filteredDossiers, filteredEvidence]
  );

  const hasResults =
    filteredNav.length > 0 || filteredDossiers.length > 0 || filteredEvidence.length > 0;
  const flattenedItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);

  const activeIndex = useMemo(
    () => flattenedItems.findIndex((item) => item.id === activeCommandId),
    [flattenedItems, activeCommandId]
  );

  useEffect(() => {
    if (!open || isLoading || flattenedItems.length === 0) {
      setActiveCommandId(null);
      return;
    }

    setActiveCommandId((previous) =>
      previous && flattenedItems.some((item) => item.id === previous)
        ? previous
        : flattenedItems[0].id
    );
  }, [open, isLoading, flattenedItems]);

  // Scroll active item into view
  useEffect(() => {
    if (!activeCommandId || !listboxRef.current) return;
    const el = listboxRef.current.querySelector(`[data-item-id="${activeCommandId}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeCommandId]);

  if (!open) return null;

  const runCommand = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  const moveActive = (offset: number) => {
    if (flattenedItems.length === 0) return;
    const current = activeIndex >= 0 ? activeIndex : 0;
    const next = (current + offset + flattenedItems.length) % flattenedItems.length;
    setActiveCommandId(flattenedItems[next].id);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!hasResults) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = flattenedItems[activeIndex >= 0 ? activeIndex : 0];
      if (target) runCommand(target.action);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(18,22,30,0.34)] backdrop-blur-md"
        aria-label="Close command palette"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-bg shadow-hard"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="card-pad relative">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-[0.66rem] uppercase tracking-[0.24em] text-muted">
                Command palette
              </div>
              <p className="mt-1 text-xs text-muted">
                Navigate pages and open records from one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded-md border border-border bg-card px-2 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-muted">
                Ctrl/Cmd K
              </kbd>
              <button
                type="button"
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-fg/70 transition hover:border-accent/60 hover:text-fg"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="card-pad-tight rounded-xl border border-border bg-card">
            <Input
              ref={inputRef}
              className="h-11 rounded-lg border-0 bg-transparent shadow-none"
              placeholder="Search commands, dossiers, or evidence..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              role="combobox"
              aria-expanded={hasResults}
              aria-controls={listboxId}
              aria-activedescendant={activeCommandId ?? undefined}
              aria-autocomplete="list"
            />
          </div>

          <div ref={listboxRef} className="mt-3 max-h-[60vh] overflow-y-auto pr-1" role="listbox" id={listboxId} aria-label="Search results">
            {isLoading && (
              <div className="card-pad-tight rounded-lg border border-dashed border-border text-sm text-muted">
                Loading index...
              </div>
            )}
            {!isLoading && !hasResults && (
              <div className="card-pad-tight rounded-lg border border-dashed border-border text-sm text-muted">
                No matches yet.
              </div>
            )}
            {!isLoading && (
              <div className="stack-md">
                {sections.map((section) => (
                  <div key={section.title} role="group" aria-label={section.title}>
                    {section.items.length > 0 ? (
                      <>
                        <div className="mb-2 flex items-center justify-between px-1">
                          <div className="text-[0.66rem] uppercase tracking-[0.22em] text-muted">
                            {section.title}
                          </div>
                          <div className="rounded-full border border-border bg-card px-2 py-0.5 text-[0.66rem] text-muted">
                            {section.items.length}
                          </div>
                        </div>
                        <div className="stack-sm">
                          {section.items.map((item) => {
                            const isActive = item.id === activeCommandId;
                            return (
                              <div
                                key={item.id}
                                role="option"
                                id={item.id}
                                data-item-id={item.id}
                                aria-selected={isActive}
                                className={`group flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                  isActive
                                    ? "border-accent/40 bg-accent/12 ring-1 ring-accent/20"
                                    : "border-border/70 bg-card hover:border-accent/30 hover:bg-accent/8"
                                }`}
                                onMouseEnter={() => setActiveCommandId(item.id)}
                                onClick={() => runCommand(item.action)}
                              >
                                <span className="min-w-0">
                                  <span
                                    className={`block truncate text-sm font-medium transition ${
                                      isActive ? "text-accent" : "text-fg group-hover:text-accent"
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  {item.subtitle ? (
                                    <span
                                      className={`mt-0.5 block truncate text-xs transition ${
                                        isActive
                                          ? "text-fg/80"
                                          : "text-muted group-hover:text-fg/75"
                                      }`}
                                    >
                                      {item.subtitle}
                                    </span>
                                  ) : null}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[0.63rem] uppercase tracking-[0.14em] transition ${
                                    isActive
                                      ? "border-accent/40 bg-accent/15 text-accent"
                                      : "border-border bg-bg text-muted group-hover:border-accent/30 group-hover:text-accent"
                                  }`}
                                >
                                  Enter
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
