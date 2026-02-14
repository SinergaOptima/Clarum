import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { DashboardsIndexClient } from "@/components/dashboards/DashboardsIndexClient";
import { loadDashboardsIndex, loadSourceStamp } from "@/data/loaders";

function toText(value: unknown, fallback = "n/a") {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export default async function DashboardsPage() {
  const [dashboardsIndexResult, sourceStampResult] = await Promise.all([
    loadDashboardsIndex(),
    loadSourceStamp(),
  ]);

  const dashboards = dashboardsIndexResult.index?.dashboards ?? [];
  const warnings = [
    ...(dashboardsIndexResult.pointer?.warnings ?? []),
    ...dashboardsIndexResult.warnings,
  ];
  const pointerPresent =
    dashboardsIndexResult.pointer?.present === true || dashboards.length > 0;

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb segments={[{ label: "Dashboards" }]} />
      <ScrollReveal>
        <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
          <div className="section-label">Export dashboards</div>
          <h1 className="mt-3 font-display text-2xl font-normal text-fg md:text-3xl">Dashboards</h1>
          <p className="section-preface max-w-3xl">
            Dashboard files shipped with the current export bundle.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Present: {pointerPresent ? "yes" : "no"}</Badge>
            <Badge variant="neutral">Count: {dashboards.length}</Badge>
            <Badge variant="neutral">
              Index: {dashboardsIndexResult.indexPath ?? dashboardsIndexResult.pointer?.index_path ?? "not found"}
            </Badge>
          </div>
          {sourceStampResult?.stamp ? (
            <p className="mt-3 text-xs text-muted">
              Last synced:{" "}
              {toText(
                (sourceStampResult.stamp as Record<string, unknown>).syncedAt,
                sourceStampResult.fetchedAt
              )}
            </p>
          ) : null}
        </section>
      </ScrollReveal>

      {warnings.length > 0 ? (
        <section className="card-pad rounded-xl border border-border/90 bg-card shadow-flush">
          <SectionHeader title="Warnings" subtitle="Dashboards index pointer diagnostics." />
          <div className="stack-sm text-sm">
            {warnings.map((warning, index) => (
              <div key={`${warning}-${index}`} className="text-muted">
                {warning}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {dashboards.length === 0 ? (
        <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
          <SectionHeader title="No Dashboards" subtitle="No dashboard index is available in this export bundle." />
          <p className="text-sm text-muted">
            Sync completed, but the dashboards index was not found or not marked present.
          </p>
        </section>
      ) : (
        <DashboardsIndexClient entries={dashboards} />
      )}
    </div>
  );
}
