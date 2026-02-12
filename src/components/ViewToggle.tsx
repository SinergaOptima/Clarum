"use client";

import { type KeyboardEvent, useRef, useState } from "react";

export function ViewToggle({
  defaultView = "report",
  reportContent,
  memoContent,
}: {
  defaultView?: "report" | "memo";
  reportContent: React.ReactNode;
  memoContent: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState<"report" | "memo">(defaultView);
  const reportTabRef = useRef<HTMLButtonElement>(null);
  const memoTabRef = useRef<HTMLButtonElement>(null);

  const focusViewTab = (view: "report" | "memo") => {
    if (view === "report") {
      reportTabRef.current?.focus();
      return;
    }
    memoTabRef.current?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = activeView === "report" ? "memo" : "report";
      setActiveView(next);
      focusViewTab(next);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = activeView === "report" ? "memo" : "report";
      setActiveView(next);
      focusViewTab(next);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveView("report");
      focusViewTab("report");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveView("memo");
      focusViewTab("memo");
    }
  };

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted">View</div>
          <div className="mt-2 font-display text-lg text-fg">Report or Memo</div>
        </div>
        <div
          className="flex items-center rounded-full border border-border/70 bg-bg/60 p-1"
          role="tablist"
          aria-label="Dossier view"
        >
          <button
            ref={reportTabRef}
            type="button"
            role="tab"
            aria-selected={activeView === "report"}
            aria-controls="panel-report"
            id="tab-report"
            tabIndex={activeView === "report" ? 0 : -1}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-all duration-150 ${
              activeView === "report" ? "bg-card text-fg shadow-soft" : "text-muted hover:text-fg"
            }`}
            onClick={() => setActiveView("report")}
            onKeyDown={onTabKeyDown}
          >
            Report
          </button>
          <button
            ref={memoTabRef}
            type="button"
            role="tab"
            aria-selected={activeView === "memo"}
            aria-controls="panel-memo"
            id="tab-memo"
            tabIndex={activeView === "memo" ? 0 : -1}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-all duration-150 ${
              activeView === "memo" ? "bg-card text-fg shadow-soft" : "text-muted hover:text-fg"
            }`}
            onClick={() => setActiveView("memo")}
            onKeyDown={onTabKeyDown}
          >
            Memo
          </button>
        </div>
      </section>

      <div
        id="panel-report"
        role="tabpanel"
        aria-labelledby="tab-report"
        hidden={activeView !== "report"}
      >
        {activeView === "report" && reportContent}
      </div>
      <div
        id="panel-memo"
        role="tabpanel"
        aria-labelledby="tab-memo"
        hidden={activeView !== "memo"}
      >
        {activeView === "memo" && memoContent}
      </div>
    </>
  );
}
