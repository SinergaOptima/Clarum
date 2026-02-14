export type DashboardEntry = {
  bytes?: number;
  kind?: string | null;
  name: string;
  relpath: string;
  sha256?: string;
};

export type DashboardsIndex = {
  version?: string;
  dashboards: DashboardEntry[];
};

export type DashboardsPointer = {
  count?: number;
  index_path?: string;
  present?: boolean;
  warnings?: string[];
};

export type KnownDashboardKind =
  | "deltas"
  | "tier_a_backlog_bundle"
  | "static_usage_report"
  | "quality_lift_wave_summary"
  | "track_counts_from_export"
  | "wave_engine_state"
  | "latest_wave_engine"
  | "unknown";

const KNOWN_KIND_LABELS: Record<KnownDashboardKind, string> = {
  deltas: "Deltas",
  tier_a_backlog_bundle: "Tier-A Backlog",
  static_usage_report: "Static Usage Report",
  quality_lift_wave_summary: "Quality Lift Wave Summary",
  track_counts_from_export: "Track Counts from Export",
  wave_engine_state: "Wave Engine State",
  latest_wave_engine: "Latest Wave Engine",
  unknown: "Other",
};

function normalize(input: string | undefined | null) {
  return String(input ?? "").trim().toLowerCase();
}

export function detectKnownDashboardKind(input: {
  kind?: string | null;
  name?: string | null;
}): KnownDashboardKind {
  const kind = normalize(input.kind);
  const name = normalize(input.name);
  const combined = `${kind} ${name}`;

  if (combined.includes("tier_a_backlog_bundle")) return "tier_a_backlog_bundle";
  if (combined.includes("deltas")) return "deltas";
  if (combined.includes("static_usage_report")) return "static_usage_report";
  if (combined.includes("track_counts_from_export")) return "track_counts_from_export";
  if (combined.includes("wave_engine_state")) return "wave_engine_state";
  if (combined.includes("latest.wave_engine")) return "latest_wave_engine";
  if (combined.includes("latest_wave_engine")) return "latest_wave_engine";
  if (/quality_lift_wave.*_summary/.test(combined)) return "quality_lift_wave_summary";
  return "unknown";
}

export function isKnownKind(kind?: string | null, name?: string | null): boolean {
  return detectKnownDashboardKind({ kind, name }) !== "unknown";
}

export function getKnownDashboardKindLabel(kind: KnownDashboardKind): string {
  return KNOWN_KIND_LABELS[kind];
}

export function normalizeDashboardsIndex(raw: unknown): DashboardsIndex | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const root = raw as Record<string, unknown>;
  const dashboardsRaw = root.dashboards;
  if (!Array.isArray(dashboardsRaw)) return null;

  const dashboards = dashboardsRaw
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name : null;
      const relpath = typeof row.relpath === "string" ? row.relpath : null;
      if (!name || !relpath) return null;
      const parsed: DashboardEntry = {
        name,
        relpath,
        bytes: typeof row.bytes === "number" ? row.bytes : undefined,
        kind: typeof row.kind === "string" ? row.kind : null,
        sha256: typeof row.sha256 === "string" ? row.sha256 : undefined,
      };
      return parsed;
    })
    .filter((item): item is DashboardEntry => item !== null);

  return {
    version: typeof root.version === "string" ? root.version : undefined,
    dashboards,
  };
}

export function sortDashboards(entries: DashboardEntry[]): DashboardEntry[] {
  return [...entries].sort((left, right) => {
    const leftKind = detectKnownDashboardKind(left);
    const rightKind = detectKnownDashboardKind(right);
    if (leftKind !== rightKind) return leftKind.localeCompare(rightKind);
    return left.name.localeCompare(right.name);
  });
}
