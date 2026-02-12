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
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
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
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => {
      previousFocusRef.current?.focus();
    };
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

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;

      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
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
        className="absolute inset-0 bg-bg/85 backdrop-blur-[6px]"
        aria-label="Close command palette"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={dialogRef}
        className="surface-raised relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/90 bg-card shadow-floating"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent via-accent3 to-accent2" />
        <div className="card-pad relative">
          <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-border/75 bg-bg/55 px-4 py-3 shadow-flush">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">
                Command palette
              </div>
              <p className="mt-1 text-xs text-muted">
                Navigate pages and open records from one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded-md border border-border bg-bg px-2 py-1 text-xs uppercase tracking-[0.1em] text-muted">
                Ctrl/Cmd K
              </kbd>
              <button
                type="button"
                className="rounded-md border border-border bg-bg px-2.5 py-1 text-xs text-fg/70 transition hover:border-accent/60 hover:text-fg"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="card-pad-tight rounded-xl border border-border/80 bg-bg shadow-inset">
            <Input
              ref={inputRef}
              className="h-11 rounded-lg border border-border/70 bg-bg/70 shadow-none"
              placeholder="Search commands, dossiers, or evidence..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              aria-label="Search commands, dossiers, or evidence"
              role="combobox"
              aria-expanded={hasResults}
              aria-controls={listboxId}
              aria-activedescendant={activeCommandId ?? undefined}
              aria-autocomplete="list"
            />
          </div>

          <div
            ref={listboxRef}
            className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-border/75 bg-bg/45 p-3 pr-2"
            role="listbox"
            id={listboxId}
            aria-label="Search results"
          >
            {isLoading && (
              <div className="card-pad-tight rounded-lg border border-dashed border-border bg-card text-sm text-muted">
                Loading index...
              </div>
            )}
            {!isLoading && !hasResults && (
              <div className="card-pad-tight rounded-lg border border-dashed border-border bg-card text-sm text-muted">
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
                          <div className="text-xs uppercase tracking-[0.14em] text-muted">
                            {section.title}
                          </div>
                          <div className="rounded-full border border-border bg-bg px-2 py-0.5 text-xs text-muted">
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
                                className={`group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                  isActive
                                    ? "border-border/75 bg-accent/10 shadow-[inset_0_0_0_1px_rgba(var(--accent),0.14)]"
                                    : "border-border/75 bg-card hover:border-accent/30 hover:bg-accent/8"
                                }`}
                                onMouseEnter={() => setActiveCommandId(item.id)}
                                onClick={() => runCommand(item.action)}
                              >
                                {isActive && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-gradient-to-b from-accent via-accent3 to-accent2"
                                  />
                                )}
                                <span className="min-w-0">
                                  <span
                                    className={`block truncate text-sm font-medium transition ${
                                      isActive
                                        ? "link-accent"
                                        : "text-fg group-hover:text-[rgb(var(--link))]"
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
                                  className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-[0.1em] transition ${
                                    isActive
                                      ? "border-accent/40 bg-accent/15 link-accent"
                                      : "border-border bg-bg text-muted group-hover:border-accent/30 group-hover:text-[rgb(var(--link))]"
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
