const fs = require("node:fs");
const path = require("node:path");
const { DASHBOARD_TARGET_FILENAMES } = require("./site_export_dashboards");
const {
  CANONICAL_TRACK_KEYS,
  computeTrackCountsFromReports,
  parseFocusTracks,
} = require("./site_export_selector");

const reportsIndexPath = path.resolve(
  "public",
  "data",
  "site_export.v1",
  "index",
  "index.reports.v1.json"
);
const sourceStampPath = path.resolve(
  "public",
  "data",
  "site_export.v1",
  "_meta",
  "source_stamp.json"
);

function fail(message) {
  console.error(`[verify] ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let focusArg = process.env.CLARUM_SYNC_FOCUS_TRACKS ?? process.env.SYNC_EXPECT_TRACKS ?? "";
  let requireNonzeroFocus = false;
  let requireDashboards = false;
  let minTotalReports = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--require-nonzero-focus") {
      requireNonzeroFocus = true;
      continue;
    }
    if (arg === "--require-dashboards") {
      requireDashboards = true;
      continue;
    }
    if (arg === "--focus" && argv[index + 1]) {
      focusArg = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--focus=")) {
      focusArg = arg.slice("--focus=".length);
      continue;
    }
    if (arg === "--min-total-reports" && argv[index + 1]) {
      minTotalReports = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg.startsWith("--min-total-reports=")) {
      minTotalReports = Number(arg.slice("--min-total-reports=".length));
      continue;
    }
  }

  if (minTotalReports !== null && (!Number.isFinite(minTotalReports) || minTotalReports < 0)) {
    fail(`Invalid --min-total-reports value: ${minTotalReports}`);
  }

  return { focusArg, requireNonzeroFocus, requireDashboards, minTotalReports };
}

function readJson(filePath, description) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${description}: ${filePath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Failed to parse ${description} at ${filePath}: ${message}`);
  }
}

const options = parseArgs(process.argv.slice(2));
const indexJson = readJson(reportsIndexPath, "reports index");
const reports = Array.isArray(indexJson?.reports) ? indexJson.reports : null;
if (!reports) {
  fail(`Invalid reports index shape in ${reportsIndexPath}: expected top-level reports array.`);
}

const trackCounts = computeTrackCountsFromReports(reports, CANONICAL_TRACK_KEYS);
const reportIds = reports.map((entry) => String(entry?.report_id || entry?.id || ""));
const dashboardsDir = path.resolve("public", "data", "site_export.v1", "dashboards");
const dashboardsPresent = DASHBOARD_TARGET_FILENAMES.filter((fileName) =>
  fs.existsSync(path.join(dashboardsDir, fileName))
);
const dashboardsMissing = DASHBOARD_TARGET_FILENAMES.filter(
  (fileName) => !dashboardsPresent.includes(fileName)
);
let stamp = null;
if (fs.existsSync(sourceStampPath)) {
  try {
    stamp = JSON.parse(fs.readFileSync(sourceStampPath, "utf8"));
  } catch {
    stamp = null;
  }
}
const focusTracksFromStamp =
  Array.isArray(stamp?.focusTracks) && stamp.focusTracks.length > 0
    ? stamp.focusTracks.filter((item) => typeof item === "string")
    : [];
const focusTracks = options.focusArg
  ? parseFocusTracks(options.focusArg)
  : focusTracksFromStamp.length > 0
    ? focusTracksFromStamp
    : parseFocusTracks("");

console.log("[verify] site_export track counts");
console.log(`[verify] index=${reportsIndexPath}`);
console.log(`[verify] total_reports=${reports.length}`);

if (stamp) {
  console.log(`[verify] stamp_mode=${stamp?.mode ?? "n/a"}`);
  console.log(`[verify] stamp_export_root=${stamp?.exportRoot ?? stamp?.vaultExportRoot ?? "n/a"}`);
  console.log(
    `[verify] stamp_candidate_count=${stamp?.candidate_count ?? stamp?.candidatesConsidered ?? "n/a"}`
  );
  console.log(
    `[verify] stamp_selected_candidate_score=${stamp?.selected_candidate_score ?? stamp?.selection?.score ?? "n/a"}`
  );
  console.log(
    `[verify] stamp_selected_candidate_reason=${stamp?.selected_candidate_reason ?? stamp?.selection?.reason ?? "n/a"}`
  );
} else {
  console.log("[verify] stamp_mode=n/a");
  console.log("[verify] stamp_export_root=n/a");
  console.log("[verify] stamp_candidate_count=n/a");
  console.log("[verify] stamp_selected_candidate_score=n/a");
  console.log("[verify] stamp_selected_candidate_reason=n/a");
}

for (const track of CANONICAL_TRACK_KEYS) {
  console.log(`[verify] ${track}=${trackCounts[track] ?? 0}`);
}

console.log("[verify] focus_tracks");
for (const track of focusTracks) {
  console.log(`[verify] ${track}=${trackCounts[track] ?? 0}`);
}

console.log(`[verify] first_report_ids=${reportIds.filter(Boolean).slice(0, 10).join(", ")}`);
console.log(
  `[verify] dashboards_present=${dashboardsPresent.length} dashboards_missing=${dashboardsMissing.length}`
);

if (
  options.minTotalReports !== null &&
  Number.isFinite(options.minTotalReports) &&
  reports.length < options.minTotalReports
) {
  fail(
    `total_reports ${reports.length} is below required minimum ${options.minTotalReports}.`
  );
}

if (options.requireNonzeroFocus) {
  const allZero = focusTracks.every((track) => (trackCounts[track] ?? 0) === 0);
  if (allZero) {
    fail(`All focus tracks are zero: ${focusTracks.join(", ")}`);
  }
}

if (options.requireDashboards && dashboardsPresent.length === 0) {
  fail("No dashboards files found in destination dashboards directory.");
}
