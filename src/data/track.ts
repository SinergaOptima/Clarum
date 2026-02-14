export type TrackKey =
  | "ev_oem_domestic"
  | "ev_oem_export"
  | "semi_osat_export"
  | "battery_supply_chain"
  | "industrial_power_grid"
  | "critical_minerals"
  | "maritime_logistics"
  | "sanctions_controls"
  | "other";

const TRACK_LABELS: Record<TrackKey, string> = {
  ev_oem_domestic: "EV OEM \u2014 Domestic",
  ev_oem_export: "EV OEM \u2014 Export",
  semi_osat_export: "Semiconductor OSAT \u2014 Export",
  battery_supply_chain: "Battery Supply Chain",
  industrial_power_grid: "Industrial Power & Grid",
  critical_minerals: "Critical Minerals & Materials",
  maritime_logistics: "Maritime & Logistics Resilience",
  sanctions_controls: "Sanctions & Controls",
  other: "Other",
};

const TRACK_DESCRIPTIONS: Record<TrackKey, string> = {
  ev_oem_domestic:
    "Focuses on operating conditions and go-to-market constraints for an OEM selling into the domestic market: policy stability, labor, infrastructure reliability, supplier environment, capital constraints, and institutional friction.",
  ev_oem_export:
    "Focuses on export-hub viability for an OEM: logistics, trade exposure, industrial capacity proxies, cross-border friction, and operational resilience for outbound supply chains.",
  semi_osat_export:
    "Focuses on OSAT export-hub suitability: manufacturing and infrastructure reliability, skilled labor signals, supply-chain dependencies, and resilience constraints relevant to packaging and testing operations.",
  battery_supply_chain:
    "Focuses on battery supply-chain resilience for export operations: upstream dependencies, processing and logistics chokepoints, and operating constraints that can disrupt throughput.",
  industrial_power_grid:
    "Focuses on industrial power reliability and grid readiness: power availability, stability bottlenecks, and resilience conditions that affect sustained industrial output.",
  critical_minerals:
    "Exposure and resilience of upstream mineral inputs (rare earths, lithium, nickel, cobalt, graphite), processing chokepoints, and policy leverage.",
  maritime_logistics:
    "Port capacity, shipping connectivity, chokepoint exposure, and logistics reliability shaping trade-dependent operations.",
  sanctions_controls:
    "Focuses on compliance friction and constraints from sanctions and export controls plus related policy volatility: operational restrictions, enforcement risk signals, and cross-border exposure that can impair market entry or supply chains.",
  other: "Reports that do not map to a known scenario track yet.",
};

const TRACK_KEYS = new Set<TrackKey>([
  "ev_oem_domestic",
  "ev_oem_export",
  "semi_osat_export",
  "battery_supply_chain",
  "industrial_power_grid",
  "critical_minerals",
  "maritime_logistics",
  "sanctions_controls",
  "other",
]);

export const TRACK_FILTER_ORDER: TrackKey[] = [
  "ev_oem_domestic",
  "ev_oem_export",
  "semi_osat_export",
  "battery_supply_chain",
  "industrial_power_grid",
  "critical_minerals",
  "maritime_logistics",
  "sanctions_controls",
  "other",
];

export const TRACK_GROUP_ORDER: TrackKey[] = [
  "ev_oem_export",
  "ev_oem_domestic",
  "semi_osat_export",
  "battery_supply_chain",
  "industrial_power_grid",
  "critical_minerals",
  "maritime_logistics",
  "sanctions_controls",
  "other",
];

export function isTrackKey(value: string): value is TrackKey {
  return TRACK_KEYS.has(value as TrackKey);
}

export function deriveTrackFromReportId(reportId: string): TrackKey {
  const normalized = reportId.toLowerCase();
  if (normalized.includes(".ev_oem_domestic.")) return "ev_oem_domestic";
  if (normalized.includes(".ev_oem_export.")) return "ev_oem_export";
  if (normalized.includes(".semi_osat_export.")) return "semi_osat_export";
  if (normalized.includes(".battery_supply_chain.")) return "battery_supply_chain";
  if (normalized.includes(".industrial_power_grid.")) return "industrial_power_grid";
  if (normalized.includes(".critical_minerals.")) return "critical_minerals";
  if (normalized.includes(".maritime_logistics.")) return "maritime_logistics";
  if (normalized.includes(".sanctions_controls.")) return "sanctions_controls";
  return "other";
}

export function normalizeTrack(value?: string | null): TrackKey {
  if (!value) return "other";
  const normalized = value.trim().toLowerCase();
  if (isTrackKey(normalized)) return normalized;
  if (normalized === "domestic") return "ev_oem_domestic";
  if (normalized === "export") return "ev_oem_export";
  return "other";
}

export function parseTrackFromSearchParam(value?: string | null): TrackKey | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isTrackKey(normalized) ? normalized : null;
}

export function getTrackLabel(track: TrackKey): string {
  return TRACK_LABELS[track];
}

export function getTrackSlug(track: TrackKey): TrackKey {
  return track;
}

export function getTrackDescription(track: TrackKey): string {
  return TRACK_DESCRIPTIONS[track];
}
