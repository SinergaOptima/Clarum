import {
  type DashboardEntry,
  detectKnownDashboardKind,
  getKnownDashboardKindLabel,
} from "@/data/dashboards";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonObject;
}

function asObjectArray(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asObject(item))
    .filter((item): item is JsonObject => item !== null);
}

function text(value: unknown, fallback = "n/a") {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function findArray(root: JsonObject | null, keys: string[]) {
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

function renderDeltas(data: JsonObject | null) {
  const rows = findArray(data, [
    "per_track_fixture_delta",
    "per_track_static_fixture_delta",
    "per_track_deltas",
    "track_deltas",
    "rows",
  ]).slice(0, 10);

  if (rows.length === 0) return <p className="text-sm text-muted">No delta rows detected.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-bg/60 text-xs uppercase tracking-[0.1em] text-muted">
          <tr>
            <th className="px-3 py-2">Track</th>
            <th className="px-3 py-2">Before</th>
            <th className="px-3 py-2">After</th>
            <th className="px-3 py-2">Delta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${text(row.track)}-${index}`} className="border-t border-border/70">
              <td className="px-3 py-2">{text(row.track ?? row.scenario_key)}</td>
              <td className="px-3 py-2">{text(row.before ?? row.value_before)}</td>
              <td className="px-3 py-2">{text(row.after ?? row.value_after)}</td>
              <td className="px-3 py-2">{text(row.delta ?? row.diff ?? row.change)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBacklog(data: JsonObject | null) {
  const rows = findArray(data, [
    "global_top_25",
    "global_top_10",
    "global_top10",
    "top_25",
    "top_10",
    "items",
    "rows",
    "backlog",
  ]).slice(0, 25);
  if (rows.length === 0) return <p className="text-sm text-muted">No backlog rows detected.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/80">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-bg/60 text-xs uppercase tracking-[0.1em] text-muted">
          <tr>
            <th className="px-3 py-2">Indicator</th>
            <th className="px-3 py-2">Country/Pack</th>
            <th className="px-3 py-2">Track</th>
            <th className="px-3 py-2">Tier</th>
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${text(row.indicator_id ?? row.id)}-${index}`} className="border-t border-border/70">
              <td className="px-3 py-2">{text(row.indicator_id ?? row.indicator ?? row.id)}</td>
              <td className="px-3 py-2">{text(row.country ?? row.pack ?? row.country_pack)}</td>
              <td className="px-3 py-2">{text(row.track ?? row.scenario_key)}</td>
              <td className="px-3 py-2">{text(row.evidence_tier ?? row.tier)}</td>
              <td className="px-3 py-2">{text(row.priority ?? row.rank)}</td>
              <td className="px-3 py-2">{text(row.why_text ?? row.reason)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderStaticUsage(data: JsonObject | null) {
  if (!data) return <p className="text-sm text-muted">No static usage data detected.</p>;
  const tier = asObject(data.evidence_tier_breakdown) ?? asObject(data.evidence_tiers) ?? data;
  const rows = ["A", "B", "UNKNOWN"]
    .filter((key) => tier[key] !== undefined)
    .map((key) => ({ key, value: text(tier[key]) }));

  if (rows.length === 0) return <p className="text-sm text-muted">No A/B/UNKNOWN breakdown detected.</p>;

  return (
    <div className="grid gap-2 sm:grid-cols-3 text-sm">
      {rows.map((row) => (
        <div key={row.key} className="rounded-lg border border-border/80 bg-bg/55 p-3">
          {row.key}: {row.value}
        </div>
      ))}
    </div>
  );
}

function renderQualityLift(data: JsonObject | null) {
  if (!data) return <p className="text-sm text-muted">No wave summary data detected.</p>;
  const fields: Array<[string, unknown]> = [
    ["wave_key", data.wave_key ?? data.wave ?? data.wave_id],
    ["selected_country_count", data.selected_country_count ?? data.target_count],
    ["selected_indicator_count", data.selected_indicator_count ?? data.indicator_count],
    ["updated_at", data.updated_at ?? data.generated_at ?? data.timestamp],
  ];
  const rows = fields.filter(([, value]) => value !== undefined && value !== null);
  if (rows.length === 0) return <p className="text-sm text-muted">No wave summary fields detected.</p>;

  return (
    <div className="grid gap-2 sm:grid-cols-2 text-sm">
      {rows.map(([key, value]) => (
        <div key={key} className="rounded-lg border border-border/80 bg-bg/55 p-3">
          {key}: {text(value)}
        </div>
      ))}
    </div>
  );
}

export function DashboardSmartView({
  entry,
  data,
}: {
  entry: DashboardEntry;
  data: Record<string, unknown> | null;
}) {
  const knownKind = detectKnownDashboardKind(entry);

  if (knownKind === "unknown") {
    return <p className="text-sm text-muted">No specialized view for this dashboard kind.</p>;
  }

  return (
    <div className="stack-sm">
      <div className="text-xs uppercase tracking-[0.1em] text-muted">
        Smart View: {getKnownDashboardKindLabel(knownKind)}
      </div>
      {knownKind === "deltas" ? renderDeltas(data) : null}
      {knownKind === "tier_a_backlog_bundle" ? renderBacklog(data) : null}
      {knownKind === "static_usage_report" ? renderStaticUsage(data) : null}
      {knownKind === "quality_lift_wave_summary" ? renderQualityLift(data) : null}
      {knownKind === "track_counts_from_export" ? renderStaticUsage(data) : null}
      {knownKind === "wave_engine_state" ? renderQualityLift(data) : null}
      {knownKind === "latest_wave_engine" ? renderQualityLift(data) : null}
    </div>
  );
}
