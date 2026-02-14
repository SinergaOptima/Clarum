import path from "node:path";
import fs from "node:fs/promises";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sortDashboards } from "@/data/dashboards";
import { loadDashboardsIndex, loadOpsDashboards, loadSourceStamp } from "@/data/loaders";

type JsonObject = Record<string, unknown>;

type BacklogRow = {
  indicatorId: string;
  countryPack: string;
  track: string;
  reason: string;
  estimatedEffort: string;
};

type DeltaRow = {
  track: string;
  before: string;
  after: string;
  delta: string;
  reason: string;
};

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonObject;
}

function asObjectArray(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asObject(item)).filter((item): item is JsonObject => item !== null);
}

function toDisplayText(value: unknown, fallback = "n/a"): string {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function findArrayByKeys(root: JsonObject | null, keys: string[]): JsonObject[] {
  if (!root) return [];
  for (const key of keys) {
    const direct = asObjectArray(root[key]);
    if (direct.length > 0) return direct;
  }

  for (const key of Object.keys(root)) {
    const nested = asObject(root[key]);
    if (!nested) continue;
    for (const nestedKey of keys) {
      const nestedArray = asObjectArray(nested[nestedKey]);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  return [];
}

function extractBacklogRows(backlog: JsonObject | null): BacklogRow[] {
  const rows = findArrayByKeys(backlog, [
    "global_top_10",
    "global_top10",
    "top_10",
    "top10",
    "items",
    "rows",
    "backlog",
  ]);

  return rows.slice(0, 10).map((row) => {
    const reasons = row.reason_codes;
    const reasonCodes = Array.isArray(reasons)
      ? reasons
          .map((code) => (typeof code === "string" ? code.trim() : ""))
          .filter((code) => code.length > 0)
          .join(", ")
      : "";

    return {
      indicatorId: toDisplayText(row.indicator_id ?? row.indicator ?? row.id),
      countryPack: toDisplayText(row.country ?? row.pack ?? row.country_pack ?? row.target_pack),
      track: toDisplayText(row.track ?? row.scenario_key ?? row.scenario),
      reason: toDisplayText(row.why_text ?? row.reason ?? reasonCodes),
      estimatedEffort: toDisplayText(
        row.estimated_effort ?? row.effort_estimate ?? row.effort ?? row.owner_effort
      ),
    };
  });
}

function extractTrackDeltaRows(deltas: JsonObject | null): DeltaRow[] {
  const rows = findArrayByKeys(deltas, [
    "per_track_fixture_delta",
    "per_track_static_fixture_delta",
    "per_track_deltas",
    "track_deltas",
    "rows",
  ]);

  return rows.map((row) => ({
    track: toDisplayText(row.track ?? row.scenario_key ?? row.scenario),
    before: toDisplayText(row.before ?? row.static_before ?? row.value_before),
    after: toDisplayText(row.after ?? row.static_after ?? row.value_after),
    delta: toDisplayText(row.delta ?? row.diff ?? row.change),
    reason: toDisplayText(row.reason ?? row.why_text ?? row.notes),
  }));
}

function extractEvidenceTierDeltaRows(
  deltas: JsonObject | null
): Array<{ tier: string; value: string }> {
  if (!deltas) return [];
  const candidate =
    asObject(deltas.evidence_tier_deltas) ??
    asObject(deltas.tier_deltas) ??
    asObject(deltas.evidence_tiers);
  if (!candidate) return [];

  return ["A", "B", "UNKNOWN"].map((tier) => ({
    tier,
    value: toDisplayText(candidate[tier]),
  }));
}

function extractGlobalSummary(deltas: JsonObject | null) {
  const summary =
    asObject(deltas?.global_summary) ?? asObject(deltas?.summary) ?? asObject(deltas?.global);
  if (!summary) return null;

  return {
    before: toDisplayText(summary.before ?? summary.value_before),
    after: toDisplayText(summary.after ?? summary.value_after),
    delta: toDisplayText(summary.delta ?? summary.diff ?? summary.change),
  };
}

function extractTrackCountsRows(trackCounts: JsonObject | null): Array<{ key: string; value: string }> {
  if (!trackCounts) return [];
  const direct = asObject(trackCounts.track_counts) ?? asObject(trackCounts.counts) ?? trackCounts;
  return Object.entries(direct)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({ key, value: toDisplayText(value) }));
}

function extractStaticUsageRows(staticUsage: JsonObject | null): Array<{ key: string; value: string }> {
  if (!staticUsage) return [];
  const tierObject =
    asObject(staticUsage.evidence_tier_breakdown) ??
    asObject(staticUsage.evidence_tiers) ??
    asObject(staticUsage.tier_breakdown) ??
    asObject(staticUsage.summary);
  if (tierObject) {
    return ["A", "B", "UNKNOWN"]
      .filter((key) => tierObject[key] !== undefined)
      .map((key) => ({ key, value: toDisplayText(tierObject[key]) }));
  }
  return Object.entries(staticUsage)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .slice(0, 6)
    .map(([key, value]) => ({ key, value: toDisplayText(value) }));
}

function extractWaveRows(
  waveState: JsonObject | null,
  latestWave: JsonObject | null
): Array<{ key: string; value: string }> {
  const source = latestWave ?? waveState;
  if (!source) return [];
  const fields = [
    ["wave_key", source.wave_key ?? source.wave ?? source.current_wave],
    ["last_run_at", source.last_run_at ?? source.updated_at ?? source.timestamp],
    [
      "selected_target_count",
      source.selected_target_count ?? source.target_count ?? source.selected_targets,
    ],
    ["run_id", source.run_id ?? source.latest_run_id],
  ] as const;
  return fields
    .filter(([, value]) => value !== undefined && value !== null && toDisplayText(value, "").length > 0)
    .map(([key, value]) => ({ key, value: toDisplayText(value) }));
}

async function getDataIntegrity() {
  const root = path.join(process.cwd(), "public", "data", "site_export.v1");
  const reportsIndex = path.join(root, "index", "index.reports.v1.json");
  const evidenceCandidates = [
    path.join(root, "evidence", "index", "index.evidence.v1.json"),
    path.join(root, "evidence", "evidence_index.v1.json"),
    path.join(root, "index", "index.evidence.v1.json"),
  ];
  const dashboardCandidates = [
    path.join(root, "dashboards", "tier_a_backlog_bundle_7c.v1.json"),
    path.join(root, "dashboards", "deltas_7c.v1.json"),
  ];

  const exists = async (target: string) => {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  };

  const reportsIndexExists = await exists(reportsIndex);
  let evidenceIndexPath: string | null = null;
  for (const candidate of evidenceCandidates) {
    if (await exists(candidate)) {
      evidenceIndexPath = candidate;
      break;
    }
  }
  let dashboardsFound = 0;
  for (const candidate of dashboardCandidates) {
    if (await exists(candidate)) dashboardsFound += 1;
  }

  return {
    reportsIndexExists,
    reportsIndexPath: reportsIndex,
    evidenceIndexExists: evidenceIndexPath !== null,
    evidenceIndexPath,
    dashboardsFound,
    dashboardsTotal: dashboardCandidates.length,
  };
}

export default async function OpsPage() {
  const [opsDashboards, dashboardsIndexResult, sourceStampResult, integrity] = await Promise.all([
    loadOpsDashboards(),
    loadDashboardsIndex(),
    loadSourceStamp(),
    getDataIntegrity(),
  ]);
  const backlogRows = extractBacklogRows(opsDashboards.tierABacklog);
  const trackDeltaRows = extractTrackDeltaRows(opsDashboards.deltas);
  const evidenceTierRows = extractEvidenceTierDeltaRows(opsDashboards.deltas);
  const globalSummary = extractGlobalSummary(opsDashboards.deltas);
  const trackCountRows = extractTrackCountsRows(opsDashboards.trackCounts);
  const staticUsageRows = extractStaticUsageRows(opsDashboards.staticUsage);
  const waveRows = extractWaveRows(opsDashboards.waveState, opsDashboards.latestWave);
  const sourceStamp = asObject(sourceStampResult?.stamp ?? null);
  const sourceTrackCounts = asObject(sourceStamp?.sourceTrackCounts);
  const destTrackCounts = asObject(sourceStamp?.destTrackCounts);
  const selection = asObject(sourceStamp?.selection);
  const destination = asObject(sourceStamp?.destination);
  const criticalSource = sourceTrackCounts?.critical_minerals;
  const maritimeSource = sourceTrackCounts?.maritime_logistics;
  const criticalDestination = destTrackCounts?.critical_minerals;
  const maritimeDestination = destTrackCounts?.maritime_logistics;
  const warnings = Array.isArray(sourceStamp?.warnings)
    ? sourceStamp.warnings
        .map((warning) => {
          if (typeof warning === "string") return warning.trim();
          const warningObj = asObject(warning);
          if (!warningObj) return "";
          const code = toDisplayText(warningObj.code, "").trim();
          const message = toDisplayText(warningObj.message, "").trim();
          if (!code && !message) return "";
          return code && message ? `${code}: ${message}` : code || message;
        })
        .filter((warning) => warning.length > 0)
    : [];
  const candidateCount = sourceStamp?.candidate_count ?? sourceStamp?.candidatesConsidered;
  const selectedCandidateScore =
    sourceStamp?.selected_candidate_score ?? selection?.score;
  const selectedCandidateReason =
    sourceStamp?.selected_candidate_reason ?? selection?.reason;
  const focusSumSource = sourceStamp?.focus_sum_source ?? selection?.focusSum;
  const focusSumDest = sourceStamp?.focus_sum_dest ?? destination?.focusSum;
  const indexedDashboards = sortDashboards(dashboardsIndexResult.index?.dashboards ?? []);
  const pointer = dashboardsIndexResult.pointer;
  const pointerWarnings = [...(pointer?.warnings ?? []), ...dashboardsIndexResult.warnings];

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb segments={[{ label: "Ops" }]} />
      <ScrollReveal>
        <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
          <div className="section-label">Operations surface</div>
          <h1 className="mt-3 font-display text-2xl font-normal text-fg md:text-3xl">Ops</h1>
          <p className="section-preface max-w-3xl">
            Read-only operational view of export dashboards for backlog and delta monitoring.
          </p>
        </section>
      </ScrollReveal>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader
          title="Dashboards Pointer"
          subtitle="Pointer status from index.reports and links to dashboard catalog."
        />
        <div className="stack-sm text-sm">
          <div>Present: {pointer?.present === true || indexedDashboards.length > 0 ? "yes" : "no"}</div>
          <div>Count: {toDisplayText(pointer?.count ?? indexedDashboards.length)}</div>
          <div>Index path: {toDisplayText(pointer?.index_path ?? dashboardsIndexResult.indexPath)}</div>
          <div className="flex flex-wrap gap-2">
            {indexedDashboards.slice(0, 6).map((entry) => (
              <Button key={entry.name} asChild size="sm" variant="outline">
                <Link href={`/dashboards/${encodeURIComponent(entry.name)}`}>{entry.name}</Link>
              </Button>
            ))}
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboards">View all</Link>
            </Button>
          </div>
          <div>
            Data truth: focus tracks source/destination =
            {" "}
            {toDisplayText(criticalSource)}/{toDisplayText(criticalDestination)} and{" "}
            {toDisplayText(maritimeSource)}/{toDisplayText(maritimeDestination)}.
          </div>
          {pointerWarnings.length > 0 ? (
            <div>Warnings: {pointerWarnings.join(" | ")}</div>
          ) : (
            <div>Warnings: none</div>
          )}
        </div>
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader
          title="Dashboards"
          subtitle="Presence and compact summaries for synced operational dashboards."
        />
        <div className="stack-sm text-sm">
          <div>
            Present: {opsDashboards.present.length > 0 ? opsDashboards.present.join(", ") : "none"}
          </div>
          <div>
            Missing: {opsDashboards.missing.length > 0 ? opsDashboards.missing.join(", ") : "none"}
          </div>
          <div>
            Quality lift summaries:{" "}
            {opsDashboards.qualityLiftSummaries.length > 0
              ? opsDashboards.qualityLiftSummaries.map((item) => item.name).join(", ")
              : "none"}
          </div>
          {opsDashboards.warnings.length > 0 ? (
            <div>Warnings: {opsDashboards.warnings.join(" | ")}</div>
          ) : (
            <div>Warnings: none</div>
          )}
        </div>

        {trackCountRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border/80">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-bg/60 text-xs uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-3 py-2">track_counts_from_export.v1.json</th>
                  <th className="px-3 py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {trackCountRows.map((row) => (
                  <tr key={row.key} className="border-t border-border/70">
                    <td className="px-3 py-2">{row.key}</td>
                    <td className="px-3 py-2">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">track_counts_from_export.v1.json not synced in current bundle.</p>
        )}

        {staticUsageRows.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {staticUsageRows.map((row) => (
              <Badge key={row.key} variant="neutral">
                {row.key}: {row.value}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">static_usage_report_7c.v1.json not synced in current bundle.</p>
        )}

        {waveRows.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
            {waveRows.map((row) => (
              <div key={row.key}>
                {row.key}: {row.value}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            wave_engine_state.v1.json / latest.wave_engine.v1.json not synced in current bundle.
          </p>
        )}
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader title="Backlog (Tier-A)" subtitle="Global top 10 priority backlog items." />
        {backlogRows.length === 0 ? (
          <p className="text-sm text-muted">Backlog dashboard not found in current export bundle.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/80">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-bg/60 text-xs uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-3 py-2">Indicator</th>
                  <th className="px-3 py-2">Country/Pack</th>
                  <th className="px-3 py-2">Track</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Effort</th>
                </tr>
              </thead>
              <tbody>
                {backlogRows.map((row) => (
                  <tr key={`${row.indicatorId}-${row.track}`} className="border-t border-border/70">
                    <td className="px-3 py-2">{row.indicatorId}</td>
                    <td className="px-3 py-2">{row.countryPack}</td>
                    <td className="px-3 py-2">{row.track}</td>
                    <td className="px-3 py-2">{row.reason}</td>
                    <td className="px-3 py-2">{row.estimatedEffort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader title="Deltas" subtitle="Per-track and evidence-tier delta overview." />
        {trackDeltaRows.length === 0 && evidenceTierRows.length === 0 && !globalSummary ? (
          <p className="text-sm text-muted">Deltas dashboard not found in current export bundle.</p>
        ) : (
          <div className="stack-md">
            {trackDeltaRows.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border/80">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-bg/60 text-xs uppercase tracking-[0.1em] text-muted">
                    <tr>
                      <th className="px-3 py-2">Track</th>
                      <th className="px-3 py-2">Before</th>
                      <th className="px-3 py-2">After</th>
                      <th className="px-3 py-2">Delta</th>
                      <th className="px-3 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackDeltaRows.map((row) => (
                      <tr key={row.track} className="border-t border-border/70">
                        <td className="px-3 py-2">{row.track}</td>
                        <td className="px-3 py-2">{row.before}</td>
                        <td className="px-3 py-2">{row.after}</td>
                        <td className="px-3 py-2">{row.delta}</td>
                        <td className="px-3 py-2">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {evidenceTierRows.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {evidenceTierRows.map((row) => (
                  <Badge key={row.tier} variant="neutral">
                    Tier {row.tier}: {row.value}
                  </Badge>
                ))}
              </div>
            ) : null}

            {globalSummary ? (
              <div className="rounded-lg border border-border/80 bg-bg/55 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-muted">Global summary</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <div>Before: {globalSummary.before}</div>
                  <div>After: {globalSummary.after}</div>
                  <div>Delta: {globalSummary.delta}</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-flush">
        <SectionHeader
          title="Export Bundle Stamp"
          subtitle="Last sync origin and focus-track counts from source_stamp.json."
        />
        {!sourceStamp ? (
          <p className="text-sm text-muted">Not synced yet. source_stamp.json not found.</p>
        ) : (
          <div className="stack-sm text-sm">
            <div>Synced at: {toDisplayText(sourceStamp.syncedAt)}</div>
            <div>Mode: {toDisplayText(sourceStamp.mode)}</div>
            <div>Selected export root: {toDisplayText(sourceStamp.exportRoot ?? sourceStamp.vaultExportRoot)}</div>
            <div>Candidate count: {toDisplayText(candidateCount)}</div>
            <div>Selected candidate score: {toDisplayText(selectedCandidateScore)}</div>
            <div>Selected candidate reason: {toDisplayText(selectedCandidateReason)}</div>
            <div>Total reports (source): {toDisplayText(selection?.totalReports ?? sourceStamp.sourceReportCount)}</div>
            <div>Total reports (destination): {toDisplayText(destination?.totalReports ?? sourceStamp.destReportCount)}</div>
            <div>Focus sum (source): {toDisplayText(focusSumSource)}</div>
            <div>Focus sum (destination): {toDisplayText(focusSumDest)}</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">
                critical_minerals source/dest: {toDisplayText(criticalSource)} /{" "}
                {toDisplayText(criticalDestination)}
              </Badge>
              <Badge variant="neutral">
                maritime_logistics source/dest: {toDisplayText(maritimeSource)} /{" "}
                {toDisplayText(maritimeDestination)}
              </Badge>
            </div>
            {warnings.length > 0 ? (
              <div>Warnings: {warnings.join(", ")}</div>
            ) : (
              <div>Warnings: none</div>
            )}
            <div className="text-xs text-muted">Stamp path: {sourceStampResult?.stampPath ?? "n/a"}</div>
          </div>
        )}
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-flush">
        <SectionHeader title="Data Integrity" subtitle="Bundle availability and operator commands." />
        <div className="stack-sm text-sm">
          <div>Dashboards fetched at: {opsDashboards.fetchedAt}</div>
          <div>Stamp fetched at: {sourceStampResult?.fetchedAt ?? "n/a"}</div>
          <div>
            Reports index: {integrity.reportsIndexExists ? "present" : "missing"} ({integrity.reportsIndexPath})
          </div>
          <div>
            Evidence index: {integrity.evidenceIndexExists ? "present" : "missing"} ({integrity.evidenceIndexPath ?? "n/a"})
          </div>
          <div>
            Dashboards present: {integrity.dashboardsFound}/{integrity.dashboardsTotal}
          </div>
          <div>
            Backlog file:{" "}
            <span className={opsDashboards.tierABacklog ? "text-fg" : "text-muted"}>
              {opsDashboards.paths.tierABacklog ?? "not found"}
            </span>
          </div>
          <div>
            Deltas file:{" "}
            <span className={opsDashboards.deltas ? "text-fg" : "text-muted"}>
              {opsDashboards.paths.deltas ?? "not found"}
            </span>
          </div>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border/80 bg-bg/55 p-3 text-xs leading-relaxed text-fg/90">
{`$env:CLARUM_VAULT_DIR='C:\\path\\to\\vault'; bun run sync-site-export
$env:CLARUM_EXPORT_ROOT='C:\\path\\to\\site_export\\v1'; bun run sync-site-export
$env:CLARUM_ALLOW_ZIP_FALLBACK='1'; bun run sync-site-export
bun run verify:site-export
bun run verify:site-export -- --require-dashboards
bun run verify:site-export -- --focus critical_minerals,maritime_logistics --require-nonzero-focus
bun run test:export-contract
bun run test
bun run build`}
        </pre>
      </section>
    </div>
  );
}
