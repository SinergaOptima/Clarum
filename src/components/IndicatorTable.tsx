import { Badge } from "@/components/ui/Badge";
import type { Indicator } from "@/data/types";

const statusMap = {
  present: { label: "Present", variant: "good" },
  partial: { label: "Partial", variant: "warn" },
  missing: { label: "Missing", variant: "danger" },
} as const;

export function IndicatorTable({ indicators }: { indicators: Indicator[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="table-wrap hidden md:block">
        <table className="table-shell w-full text-sm">
          <thead className="bg-border/40 text-left text-xs font-semibold uppercase tracking-wide text-fg/70">
            <tr>
              <th className="px-3 py-2">Indicator</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map((indicator) => {
              const status = statusMap[indicator.status];
              const sourceLabel = indicator.sourceInstitution || indicator.source || "—";
              const urls = indicator.urls ?? [];
              const detailItems = getDetailItems(indicator);
              return (
                <tr
                  key={indicator.id}
                  className="border-t border-border even:bg-border/20 hover:bg-accent/5"
                >
                  <td className="px-3 py-2 font-medium text-fg">{indicator.name}</td>
                  <td className="px-3 py-2 text-fg/80">
                    {indicator.value} {indicator.unit}
                  </td>
                  <td className="px-3 py-2 text-fg/80">{indicator.year}</td>
                  <td className="px-3 py-2 text-fg/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{sourceLabel}</span>
                      {urls.length > 0 && (
                        <a
                          className="text-xs font-medium text-accent hover:underline"
                          href={urls[0]}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open source: ${sourceLabel}`}
                        >
                          Open
                        </a>
                      )}
                      {urls.length > 1 && (
                        <details className="group text-xs">
                          <summary className="cursor-pointer text-accent hover:underline">
                            +{urls.length - 1} more sources
                          </summary>
                          <div className="mt-2 space-y-1">
                            {urls.slice(1).map((url) => (
                              <a
                                key={url}
                                className="block text-xs text-accent hover:underline"
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Source URL for ${indicator.name}`}
                              >
                                {url}
                              </a>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-fg/80">
                    {detailItems.length === 0 ? (
                      "—"
                    ) : (
                      <details>
                        <summary className="cursor-pointer text-accent hover:underline">
                          View {detailItems.length} detail{detailItems.length > 1 ? "s" : ""}
                        </summary>
                        <div className="mt-2 space-y-1">
                          {detailItems.map((item, index) => (
                            <div key={`${indicator.id}-${index}`}>{item}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="grid gap-3 md:hidden">
        {indicators.map((indicator) => {
          const status = statusMap[indicator.status];
          const sourceLabel = indicator.sourceInstitution || indicator.source || "—";
          const urls = indicator.urls ?? [];
          const detailItems = getDetailItems(indicator);
          return (
            <div
              key={indicator.id}
              className="rounded-lg border border-border bg-card p-3 text-sm shadow-flush"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-fg">{indicator.name}</div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-fg/80">
                <div>
                  <span className="text-muted">Value:</span> {indicator.value} {indicator.unit}
                </div>
                <div>
                  <span className="text-muted">Year:</span> {indicator.year}
                </div>
              </div>
              <div className="mt-2 text-xs text-fg/80">
                <span className="text-muted">Source:</span> {sourceLabel}
                {urls.length > 0 && (
                  <>
                    {" · "}
                    <a
                      className="text-accent hover:underline"
                      href={urls[0]}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open source: ${sourceLabel}`}
                    >
                      Open
                    </a>
                  </>
                )}
              </div>
              {detailItems.length > 0 && (
                <details className="mt-2 text-xs text-fg/80">
                  <summary className="cursor-pointer text-accent hover:underline">
                    View {detailItems.length} detail{detailItems.length > 1 ? "s" : ""}
                  </summary>
                  <div className="mt-1 space-y-1 pl-2 border-l border-border">
                    {detailItems.map((item, index) => (
                      <div key={`${indicator.id}-mobile-${index}`}>{item}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function getDetailItems(indicator: Indicator): string[] {
  const items: string[] = [];
  if (indicator.notes) items.push(`Notes: ${indicator.notes}`);
  if (indicator.missingValue) items.push("Missing value");
  if (indicator.missingUrl) items.push("Missing URL");
  if (indicator.missingDate) items.push("Missing date");
  if (indicator.isCompleteStrict !== undefined) {
    items.push(`Strict completeness: ${indicator.isCompleteStrict ? "Yes" : "No"}`);
  }
  return items;
}
