const crypto = require("node:crypto");

const CANONICAL_TRACK_KEYS = [
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

const DEFAULT_FOCUS_TRACKS = ["critical_minerals", "maritime_logistics"];

function normalizePathForMatch(value) {
  return String(value || "").replace(/\\/g, "/").toLowerCase();
}

function deriveTrackFromReportId(reportId) {
  const normalized = String(reportId || "").toLowerCase();
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

function parseFocusTracks(value, fallback = DEFAULT_FOCUS_TRACKS) {
  if (!value || typeof value !== "string") return [...fallback];
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...fallback];
}

function parseMinReports(value, fallback = 1) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function computeTrackCountsFromReports(reports, trackKeys = CANONICAL_TRACK_KEYS) {
  const counts = Object.fromEntries(trackKeys.map((key) => [key, 0]));
  for (const entry of reports) {
    const reportId = String(entry?.report_id || entry?.id || "").trim();
    const track = deriveTrackFromReportId(reportId);
    counts[track] = (counts[track] ?? 0) + 1;
  }
  return counts;
}

function computeFocusMetrics(trackCounts, focusTracks) {
  const focusCounts = Object.fromEntries(
    focusTracks.map((track) => [track, trackCounts?.[track] ?? 0])
  );
  const focusValues = Object.values(focusCounts);
  const focusSum = focusValues.reduce((sum, value) => sum + value, 0);
  const minFocus = focusValues.length > 0 ? Math.min(...focusValues) : 0;
  return { focusCounts, focusSum, minFocus };
}

function sha256Hex(valueBuffer) {
  return crypto.createHash("sha256").update(valueBuffer).digest("hex");
}

function shortHash(fullHash) {
  return String(fullHash || "").slice(0, 12);
}

function isExcludedDiscoveryPath(pathValue) {
  const normalized = normalizePathForMatch(pathValue);
  if (normalized.includes("/node_modules/")) return true;
  if (normalized.includes("/.next/")) return true;
  if (normalized.includes("/.git/")) return true;
  if (normalized.includes("/dist/")) return true;
  if (normalized.includes("/build/")) return true;
  if (normalized.includes("/coverage/")) return true;
  if (normalized.includes("/out/")) return true;
  if (normalized.includes("/public/data/site_export.v1/")) return true;
  if (normalized.includes("/_machine/fixtures/")) return true;
  if (normalized.includes("/fixtures/")) return true;
  if (normalized.includes("golden")) return true;
  return false;
}

function computeCandidateScore(candidate) {
  if (!candidate?.valid) return Number.NEGATIVE_INFINITY;
  const totalReports = Number(candidate?.totalReports ?? 0);
  const focusSum = Number(candidate?.focusSum ?? 0);
  const validEvidence = candidate?.hasEvidenceIndex ? 1 : 0;
  return totalReports * 1000 + focusSum * 100 + validEvidence * 10;
}

function candidateSortComparator(left, right) {
  const leftValid = left?.valid ? 1 : 0;
  const rightValid = right?.valid ? 1 : 0;
  if (leftValid !== rightValid) return rightValid - leftValid;

  const leftScore = computeCandidateScore(left);
  const rightScore = computeCandidateScore(right);
  if (leftScore !== rightScore) return rightScore - leftScore;

  const leftFocusSum = left?.focusSum ?? 0;
  const rightFocusSum = right?.focusSum ?? 0;
  if (leftFocusSum !== rightFocusSum) return rightFocusSum - leftFocusSum;

  const leftReports = left?.totalReports ?? 0;
  const rightReports = right?.totalReports ?? 0;
  if (leftReports !== rightReports) return rightReports - leftReports;

  const leftMtime = left?.indexMtimeMs ?? 0;
  const rightMtime = right?.indexMtimeMs ?? 0;
  if (leftMtime !== rightMtime) return rightMtime - leftMtime;

  const leftRoot = String(left?.root || "");
  const rightRoot = String(right?.root || "");
  return leftRoot.localeCompare(rightRoot);
}

function rankCandidates(candidates) {
  return [...candidates].sort(candidateSortComparator);
}

function chooseCandidateFromList(candidates, options = {}) {
  const focusTracks = options.focusTracks ?? DEFAULT_FOCUS_TRACKS;
  const explicitRoot = options.explicitRoot ? String(options.explicitRoot) : null;
  const minReports = options.minReports ?? 1;

  if (explicitRoot) {
    const matched = candidates.find((candidate) => candidate.root === explicitRoot);
    if (!matched) {
      throw new Error(`Explicit export root not found among candidates: ${explicitRoot}`);
    }
    return {
      selected: matched,
      ranked: [matched],
      reason: "explicit_override",
      selectedScore: computeCandidateScore(matched),
      focusTracks,
    };
  }

  const validCandidates = candidates.filter(
    (candidate) => candidate.valid && (candidate.totalReports ?? 0) >= minReports
  );
  if (validCandidates.length === 0) {
    return {
      selected: null,
      ranked: [],
      reason: "no_valid_candidates",
      selectedScore: Number.NEGATIVE_INFINITY,
      focusTracks,
    };
  }

  const ranked = rankCandidates(validCandidates);
  const selected = ranked[0] ?? null;
  const reason = ranked.length === 1 ? "only_candidate" : "best_score";

  return {
    selected,
    ranked,
    reason,
    selectedScore: selected ? computeCandidateScore(selected) : Number.NEGATIVE_INFINITY,
    focusTracks,
  };
}

function findBetterFocusCandidate(selected, candidates) {
  if (!selected || !selected.valid) return null;
  if ((selected.focusSum ?? 0) > 0) return null;

  const validWithFocus = candidates.filter(
    (candidate) => candidate.valid && (candidate.focusSum ?? 0) > 0
  );
  if (validWithFocus.length === 0) return null;
  return rankCandidates(validWithFocus)[0] ?? null;
}

module.exports = {
  CANONICAL_TRACK_KEYS,
  DEFAULT_FOCUS_TRACKS,
  chooseCandidateFromList,
  computeCandidateScore,
  computeFocusMetrics,
  computeTrackCountsFromReports,
  deriveTrackFromReportId,
  findBetterFocusCandidate,
  isExcludedDiscoveryPath,
  parseFocusTracks,
  parseMinReports,
  rankCandidates,
  sha256Hex,
  shortHash,
};
