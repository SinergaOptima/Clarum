"use client";

import { useState } from "react";

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
            type="button"
            role="tab"
            aria-selected={activeView === "report"}
            aria-controls="panel-report"
            id="tab-report"
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-all duration-150 ${
              activeView === "report" ? "bg-card text-fg shadow-soft" : "text-muted hover:text-fg"
            }`}
            onClick={() => setActiveView("report")}
          >
            Report
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "memo"}
            aria-controls="panel-memo"
            id="tab-memo"
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.16em] transition-all duration-150 ${
              activeView === "memo" ? "bg-card text-fg shadow-soft" : "text-muted hover:text-fg"
            }`}
            onClick={() => setActiveView("memo")}
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
