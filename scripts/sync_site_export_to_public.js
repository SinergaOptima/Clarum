require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const AdmZip = require("adm-zip");
const {
  DASHBOARD_TARGET_FILENAMES,
  copyDashboardsToDestination,
} = require("./site_export_dashboards");
const {
  CANONICAL_TRACK_KEYS,
  chooseCandidateFromList,
  computeCandidateScore,
  computeFocusMetrics,
  computeTrackCountsFromReports,
  findBetterFocusCandidate,
  isExcludedDiscoveryPath,
  parseFocusTracks,
  parseMinReports,
  sha256Hex,
  shortHash,
} = require("./site_export_selector");

const REPORTS_INDEX_REL = "index/index.reports.v1.json";
const EVIDENCE_INDEX_REL_CANDIDATES = [
  "evidence/index/index.evidence.v1.json",
  "evidence/evidence_index.v1.json",
  "index/index.evidence.v1.json",
];
const DASHBOARD_REL_PATHS = DASHBOARD_TARGET_FILENAMES.map((fileName) => `dashboards/${fileName}`);
const EXCLUDED_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  ".git",
  "public",
  "dist",
  "build",
  "out",
  "coverage",
  "fixtures",
  "__fixtures__",
  ".turbo",
  ".cache",
]);

const envFocusTracks = process.env.CLARUM_SYNC_FOCUS_TRACKS ?? process.env.SYNC_EXPECT_TRACKS;
const focusTracks = parseFocusTracks(envFocusTracks);
const minReports = parseMinReports(
  process.env.CLARUM_SYNC_MIN_REPORTS ?? process.env.SYNC_MIN_REPORTS,
  1
);

const explicitExportRootInput =
  process.env.CLARUM_EXPORT_ROOT?.trim() ??
  process.env.CLARUM_VAULT_EXPORT_ROOT?.trim() ??
  "";
const explicitExportRoot = explicitExportRootInput ? path.resolve(explicitExportRootInput) : null;
const vaultDirInput = process.env.CLARUM_VAULT_DIR?.trim() ?? "";
const vaultDir = vaultDirInput ? path.resolve(vaultDirInput) : null;
const zipPath = path.resolve(process.env.CLARUM_VAULT_ZIP || "13 - Lattice Labs.zip");
const allowZipFallback = process.env.CLARUM_ALLOW_ZIP_FALLBACK === "1";
const allowFocusMismatch = process.env.CLARUM_ALLOW_FOCUS_MISMATCH === "1";

const syncedAt = new Date().toISOString();
const destDir = path.resolve("public", "data", "site_export.v1");
const destReportsIndexPath = path.join(destDir, REPORTS_INDEX_REL);

function fail(message) {
  console.error(`[sync] ERROR: ${message}`);
  process.exit(1);
}

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function safeReadJsonFromFile(filePath) {
  const bytes = fs.readFileSync(filePath);
  return { bytes, json: JSON.parse(bytes.toString("utf8")) };
}

function toIso(value) {
  try {
    return new Date(value).toISOString();
  } catch {
    return "n/a";
  }
}

function selectExistingEvidencePath(root) {
  for (const relPath of EVIDENCE_INDEX_REL_CANDIDATES) {
    const fullPath = path.join(root, normalizePath(relPath));
    if (fs.existsSync(fullPath)) {
      return { relPath, fullPath };
    }
  }
  return null;
}

function isValidExportRoot(root) {
  const reportsPath = path.join(root, normalizePath(REPORTS_INDEX_REL));
  if (!fs.existsSync(reportsPath)) {
    return { ok: false, reason: `missing ${REPORTS_INDEX_REL}`, reportsPath, evidencePath: null };
  }

  const evidenceInfo = selectExistingEvidencePath(root);
  if (!evidenceInfo) {
    return {
      ok: false,
      reason: `missing evidence index (${EVIDENCE_INDEX_REL_CANDIDATES.join(" or ")})`,
      reportsPath,
      evidencePath: null,
    };
  }

  return {
    ok: true,
    reason: "valid",
    reportsPath,
    evidencePath: evidenceInfo.fullPath,
    evidenceRelPath: evidenceInfo.relPath,
  };
}

function readIndex(root) {
  const validation = isValidExportRoot(root);
  if (!validation.ok) {
    return {
      ok: false,
      reason: validation.reason,
      reportsPath: validation.reportsPath,
      evidencePath: validation.evidencePath,
      root,
    };
  }

  let parsed;
  try {
    parsed = safeReadJsonFromFile(validation.reportsPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      reason: `failed to parse reports index: ${message}`,
      reportsPath: validation.reportsPath,
      evidencePath: validation.evidencePath,
      root,
    };
  }

  const reports = Array.isArray(parsed.json?.reports) ? parsed.json.reports : null;
  if (!reports) {
    return {
      ok: false,
      reason: "reports index shape invalid (missing reports array)",
      reportsPath: validation.reportsPath,
      evidencePath: validation.evidencePath,
      root,
    };
  }

  const stats = buildStatsFromReports(reports);
  const indexStat = fs.statSync(validation.reportsPath);

  return {
    ok: true,
    reason: "valid",
    root,
    reportsPath: validation.reportsPath,
    evidencePath: validation.evidencePath,
    evidenceRelPath: validation.evidenceRelPath,
    indexBytes: parsed.bytes,
    indexSha256: sha256Hex(parsed.bytes),
    indexMtimeMs: indexStat.mtimeMs,
    ...stats,
  };
}

function buildStatsFromReports(reports) {
  const trackCounts = computeTrackCountsFromIndex(reports);
  const focus = computeFocusMetrics(trackCounts, focusTracks);
  const reportIds = reports.map((entry) => String(entry?.report_id || entry?.id || "").trim());
  return {
    reports,
    totalReports: reports.length,
    trackCounts,
    focusCounts: focus.focusCounts,
    focusSum: focus.focusSum,
    minFocus: focus.minFocus,
    reportIds,
  };
}

function computeTrackCountsFromIndex(reports) {
  return computeTrackCountsFromReports(reports, CANONICAL_TRACK_KEYS);
}

function discoverCandidateRoots(vaultRootDir) {
  const commonCandidates = [
    path.join(vaultRootDir, "09 - Publishing", "site_export", "v1"),
    path.join(vaultRootDir, "Publishing", "site_export", "v1"),
    path.join(vaultRootDir, "site_export", "v1"),
    path.join(vaultRootDir, "Clarum", "09 - Publishing", "site_export", "v1"),
    path.join(vaultRootDir, "Clarum", "Publishing", "site_export", "v1"),
    path.join(vaultRootDir, "Clarum", "site_export", "v1"),
  ];

  const found = new Set();
  for (const candidate of commonCandidates) {
    if (fs.existsSync(candidate)) found.add(path.resolve(candidate));
  }

  const maxDepth = 8;
  const stack = [{ dir: vaultRootDir, depth: 0 }];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const currentDir = current.dir;

    if (current.depth > maxDepth) continue;
    if (current.depth > 0 && isExcludedDiscoveryPath(currentDir)) continue;

    const reportsPath = path.join(currentDir, normalizePath(REPORTS_INDEX_REL));
    if (fs.existsSync(reportsPath)) {
      found.add(path.resolve(currentDir));
    }

    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const lower = entry.name.toLowerCase();
      if (EXCLUDED_DIR_NAMES.has(lower)) continue;
      const nextDir = path.join(currentDir, entry.name);
      if (isExcludedDiscoveryPath(nextDir)) continue;
      stack.push({ dir: nextDir, depth: current.depth + 1 });
    }
  }

  return Array.from(found).sort((left, right) => left.localeCompare(right));
}

function toVaultCandidate(root) {
  const result = readIndex(root);
  if (!result.ok) {
    return {
      root,
      valid: false,
      reason: result.reason,
      reportsPath: result.reportsPath ?? null,
      evidencePath: result.evidencePath ?? null,
      totalReports: 0,
      trackCounts: Object.fromEntries(CANONICAL_TRACK_KEYS.map((key) => [key, 0])),
      focusCounts: Object.fromEntries(focusTracks.map((track) => [track, 0])),
      focusSum: 0,
      minFocus: 0,
      indexSha256: null,
      indexBytes: null,
      indexMtimeMs: 0,
      reportIds: [],
      sourceType: "vault",
      hasEvidenceIndex: false,
      dashboardsFound: 0,
      pathPreference: 0,
    };
  }

  let dashboardsFound = 0;
  for (const relPath of DASHBOARD_REL_PATHS) {
    const fullPath = path.join(root, normalizePath(relPath));
    if (fs.existsSync(fullPath)) dashboardsFound += 1;
  }

  let pathPreference = 0;
  const normalized = normalizePath(root).toLowerCase();
  if (normalized.includes("/09 - publishing/site_export/v1")) pathPreference += 100;
  if (normalized.endsWith("/site_export/v1")) pathPreference += 10;

  return {
    root,
    valid: true,
    reason: "valid",
    reportsPath: result.reportsPath,
    evidencePath: result.evidencePath,
    totalReports: result.totalReports,
    trackCounts: result.trackCounts,
    focusCounts: result.focusCounts,
    focusSum: result.focusSum,
    minFocus: result.minFocus,
    indexSha256: result.indexSha256,
    indexBytes: result.indexBytes,
    indexMtimeMs: result.indexMtimeMs,
    reportIds: result.reportIds,
    sourceType: "vault",
    hasEvidenceIndex: true,
    dashboardsFound,
    pathPreference,
  };
}

function discoverZipCandidates(zipFilePath) {
  let zip;
  try {
    zip = new AdmZip(zipFilePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Failed to open zip: ${zipFilePath}. ${message}`);
  }

  const entries = zip.getEntries();
  const fileNames = entries.filter((entry) => !entry.isDirectory).map((entry) => normalizePath(entry.entryName));
  const prefixes = Array.from(
    new Set(
      fileNames
        .filter((name) => name.endsWith(REPORTS_INDEX_REL))
        .map((name) => name.slice(0, -REPORTS_INDEX_REL.length))
    )
  );

  const candidates = [];
  for (const prefix of prefixes) {
    if (isExcludedDiscoveryPath(prefix)) continue;

    const reportsEntryPath = `${prefix}${REPORTS_INDEX_REL}`;
    const reportsEntry = zip.getEntry(reportsEntryPath);
    if (!reportsEntry) continue;

    const evidenceRel = EVIDENCE_INDEX_REL_CANDIDATES.find((relPath) =>
      fileNames.includes(`${prefix}${normalizePath(relPath)}`)
    );
    if (!evidenceRel) {
      candidates.push({
        root: `${zipFilePath}::${prefix}`,
        valid: false,
        reason: `missing evidence index (${EVIDENCE_INDEX_REL_CANDIDATES.join(" or ")})`,
        totalReports: 0,
        trackCounts: Object.fromEntries(CANONICAL_TRACK_KEYS.map((key) => [key, 0])),
        focusCounts: Object.fromEntries(focusTracks.map((track) => [track, 0])),
        focusSum: 0,
        minFocus: 0,
        indexSha256: null,
        indexBytes: null,
        indexMtimeMs: 0,
        reportIds: [],
        sourceType: "zip",
        zipPrefix: prefix,
        hasEvidenceIndex: false,
        dashboardsFound: 0,
        pathPreference: 0,
      });
      continue;
    }

    let indexJson;
    const indexBytes = reportsEntry.getData();
    try {
      indexJson = JSON.parse(indexBytes.toString("utf8"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      candidates.push({
        root: `${zipFilePath}::${prefix}`,
        valid: false,
        reason: `failed to parse reports index: ${message}`,
        totalReports: 0,
        trackCounts: Object.fromEntries(CANONICAL_TRACK_KEYS.map((key) => [key, 0])),
        focusCounts: Object.fromEntries(focusTracks.map((track) => [track, 0])),
        focusSum: 0,
        minFocus: 0,
        indexSha256: null,
        indexBytes: null,
        indexMtimeMs: 0,
        reportIds: [],
        sourceType: "zip",
        zipPrefix: prefix,
        hasEvidenceIndex: true,
        dashboardsFound: 0,
        pathPreference: 0,
      });
      continue;
    }

    const reports = Array.isArray(indexJson?.reports) ? indexJson.reports : null;
    if (!reports) {
      candidates.push({
        root: `${zipFilePath}::${prefix}`,
        valid: false,
        reason: "reports index shape invalid (missing reports array)",
        totalReports: 0,
        trackCounts: Object.fromEntries(CANONICAL_TRACK_KEYS.map((key) => [key, 0])),
        focusCounts: Object.fromEntries(focusTracks.map((track) => [track, 0])),
        focusSum: 0,
        minFocus: 0,
        indexSha256: null,
        indexBytes: null,
        indexMtimeMs: 0,
        reportIds: [],
        sourceType: "zip",
        zipPrefix: prefix,
        hasEvidenceIndex: true,
        dashboardsFound: 0,
        pathPreference: 0,
      });
      continue;
    }

    const stats = buildStatsFromReports(reports);
    const mtimeMs = reportsEntry.header?.time ? reportsEntry.header.time.getTime() : 0;
    let dashboardsFound = 0;
    for (const relPath of DASHBOARD_REL_PATHS) {
      if (fileNames.includes(`${prefix}${normalizePath(relPath)}`)) dashboardsFound += 1;
    }
    let pathPreference = 0;
    const normalizedPrefix = prefix.toLowerCase();
    if (normalizedPrefix.includes("/09 - publishing/site_export/v1/")) pathPreference += 100;
    if (normalizedPrefix.endsWith("/site_export/v1/")) pathPreference += 10;
    candidates.push({
      root: `${zipFilePath}::${prefix}`,
      valid: true,
      reason: "valid",
      totalReports: stats.totalReports,
      trackCounts: stats.trackCounts,
      focusCounts: stats.focusCounts,
      focusSum: stats.focusSum,
      minFocus: stats.minFocus,
      indexSha256: sha256Hex(indexBytes),
      indexBytes,
      indexMtimeMs: mtimeMs,
      reportIds: stats.reportIds,
      sourceType: "zip",
      zipPrefix: prefix,
      zipFilePath,
      reportsEntryPath,
      evidenceEntryPath: `${prefix}${normalizePath(evidenceRel)}`,
      hasEvidenceIndex: true,
      dashboardsFound,
      pathPreference,
    });
  }

  return { zip, candidates };
}

function printCandidateTable(title, candidates) {
  console.log(`[sync] ${title}`);
  if (candidates.length === 0) {
    console.log("[sync] (no candidates)");
    return;
  }

  const sortedByPath = [...candidates].sort((left, right) => left.root.localeCompare(right.root));
  for (const candidate of sortedByPath) {
    const score = computeCandidateScore(candidate);
    const focusSummary = focusTracks
      .map((track) => `${track}:${candidate.focusCounts?.[track] ?? 0}`)
      .join(",");
    console.log(
      `[sync] candidate valid=${candidate.valid ? "yes" : "no"} score=${Number.isFinite(score) ? score : "n/a"} ` +
        `reports=${candidate.totalReports ?? 0} focus_sum=${candidate.focusSum ?? 0} evidence=${candidate.hasEvidenceIndex ? 1 : 0} ` +
        `mtime=${toIso(candidate.indexMtimeMs)} hash=${
          candidate.indexSha256 ? shortHash(candidate.indexSha256) : "n/a"
        } focus=[${focusSummary}] root=${candidate.root}${candidate.reason ? ` reason=${candidate.reason}` : ""}`
    );
  }
}

function applyMinReportsConstraint(candidates, minimumReports) {
  for (const candidate of candidates) {
    if (!candidate.valid) continue;
    if ((candidate.totalReports ?? 0) >= minimumReports) continue;
    candidate.valid = false;
    candidate.reason = `below minimum reports (${candidate.totalReports} < ${minimumReports})`;
  }
}

function extractZipToDestination(zip, prefix, destinationRoot) {
  let copied = 0;
  for (const entry of zip.getEntries()) {
    const entryName = normalizePath(entry.entryName);
    if (entry.isDirectory) continue;
    if (!entryName.startsWith(prefix)) continue;

    const relPath = entryName.slice(prefix.length);
    if (!relPath) continue;
    const outputPath = path.join(destinationRoot, relPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, entry.getData());
    copied += 1;
  }
  return copied;
}

function copyDirectoryRecursive(sourceDir, targetDir) {
  let copied = 0;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copied += copyDirectoryRecursive(sourcePath, targetPath);
      continue;
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    copied += 1;
  }
  return copied;
}

function toStringOrUndefined(value) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function normalizeUrls(raw) {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const filtered = raw.filter((item) => typeof item === "string" && item.trim().length > 0);
    return filtered.length > 0 ? filtered : undefined;
  }
  if (typeof raw === "string" && raw.trim().length > 0) return [raw];
  return undefined;
}

function toPayloadFromReport(reportJson, fallbackTitle) {
  const indicatorsObj =
    reportJson && typeof reportJson === "object" && reportJson.indicators
      ? reportJson.indicators
      : {};
  const indicatorEntries = Object.entries(indicatorsObj);

  return {
    meta: {
      title:
        toStringOrUndefined(reportJson?.meta?.case?.case_id) ??
        toStringOrUndefined(reportJson?.meta?.title) ??
        fallbackTitle,
      case_id:
        toStringOrUndefined(reportJson?.meta?.case?.case_id) ??
        toStringOrUndefined(reportJson?.meta?.title) ??
        fallbackTitle,
    },
    confidence: {
      overall_cap: toStringOrUndefined(reportJson?.confidence?.overall_cap) ?? "medium",
    },
    completeness: {
      overall_pct:
        typeof reportJson?.completeness?.overall_pct === "number"
          ? reportJson.completeness.overall_pct
          : 0,
      domain_breakdown:
        reportJson?.completeness?.domain_breakdown &&
        typeof reportJson.completeness.domain_breakdown === "object"
          ? reportJson.completeness.domain_breakdown
          : {},
    },
    indicators: indicatorEntries.map(([id, indicator]) => {
      const item = indicator && typeof indicator === "object" ? indicator : {};
      return {
        id,
        label: toStringOrUndefined(item.label) ?? id,
        value:
          item.value !== undefined && item.value !== null
            ? item.value
            : toStringOrUndefined(item.latest_value) ?? "",
        unit: toStringOrUndefined(item.unit) ?? "",
        year: toStringOrUndefined(item.retrieved_date) ?? null,
        source_institution:
          toStringOrUndefined(item.source_institution) ?? toStringOrUndefined(item.source) ?? "",
        domain: toStringOrUndefined(item.domain),
        urls: normalizeUrls(item.urls ?? item.url ?? item.source_url) ?? [],
        notes: toStringOrUndefined(item.notes) ?? "",
        is_complete_strict: Boolean(
          item.is_complete_strict !== undefined ? item.is_complete_strict : true
        ),
        missing_value: Boolean(item.missing_value),
        missing_url: Boolean(item.missing_url),
        missing_date: Boolean(item.missing_date),
      };
    }),
    evidence_refs: Array.isArray(reportJson?.evidence_refs)
      ? reportJson.evidence_refs.filter((ref) => typeof ref === "string" && ref.trim().length > 0)
      : [],
  };
}

function ensureReportIdAlias() {
  if (!fs.existsSync(destReportsIndexPath)) return { updated: 0 };
  try {
    const parsed = JSON.parse(fs.readFileSync(destReportsIndexPath, "utf8"));
    const reports = Array.isArray(parsed?.reports) ? parsed.reports : [];
    let updated = 0;
    for (const report of reports) {
      if (!report || typeof report !== "object") continue;
      if (typeof report.report_id === "string" && report.report_id.trim().length > 0) continue;
      if (typeof report.id === "string" && report.id.trim().length > 0) {
        report.report_id = report.id;
        updated += 1;
      }
    }
    if (updated > 0) {
      fs.writeFileSync(destReportsIndexPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    }
    return { updated };
  } catch {
    return { updated: 0 };
  }
}

function backfillMissingPayloads() {
  if (!fs.existsSync(destReportsIndexPath)) return { generated: 0, failed: 0 };
  let generated = 0;
  let failed = 0;

  try {
    const parsed = JSON.parse(fs.readFileSync(destReportsIndexPath, "utf8"));
    const reports = Array.isArray(parsed?.reports) ? parsed.reports : [];
    for (const report of reports) {
      const id = typeof report?.id === "string" ? report.id : null;
      const country = typeof report?.country === "string" ? report.country : "Unknown";
      const reportPathFromIndex = typeof report?.path === "string" ? report.path : null;
      if (!id || !reportPathFromIndex) continue;

      const payloadPath = path.join(destDir, "index", `${id}.payload.v1.json`);
      if (fs.existsSync(payloadPath)) continue;

      const reportPath = path.join(destDir, normalizePath(reportPathFromIndex));
      if (!fs.existsSync(reportPath)) {
        failed += 1;
        continue;
      }

      try {
        const reportJson = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        const payload = toPayloadFromReport(reportJson, `${country} dossier`);
        fs.mkdirSync(path.dirname(payloadPath), { recursive: true });
        fs.writeFileSync(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
        generated += 1;
      } catch {
        failed += 1;
      }
    }
  } catch {
    return { generated: 0, failed: 0 };
  }

  return { generated, failed };
}

function ensureDestinationShape() {
  const validation = isValidExportRoot(destDir);
  if (!validation.ok) {
    fail(
      `Destination export root invalid after copy: ${validation.reason}. Destination: ${destDir}`
    );
  }
  return validation;
}

function readDestinationStats() {
  if (!fs.existsSync(destReportsIndexPath)) {
    fail(`Missing destination reports index after sync: ${destReportsIndexPath}`);
  }
  const parsed = safeReadJsonFromFile(destReportsIndexPath);
  const reports = Array.isArray(parsed.json?.reports) ? parsed.json.reports : null;
  if (!reports) {
    fail(`Destination reports index shape invalid at ${destReportsIndexPath}`);
  }
  const stats = buildStatsFromReports(reports);
  return {
    ...stats,
    indexSha256: sha256Hex(parsed.bytes),
    indexBytes: parsed.bytes,
  };
}

function writeSourceStamp(stampObject) {
  const metaDir = path.join(destDir, "_meta");
  fs.mkdirSync(metaDir, { recursive: true });
  const outputPath = path.join(metaDir, "source_stamp.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(stampObject, null, 2)}\n`, "utf8");
  return outputPath;
}

function formatTrackCounts(trackCounts) {
  return CANONICAL_TRACK_KEYS.map((key) => `${key}=${trackCounts?.[key] ?? 0}`).join(", ");
}

function warningEntry(code, message, details) {
  return { code, message, details: details ?? null };
}

let mode = "";
let selected = null;
let selectionReason = "";
let selectedScore = Number.NEGATIVE_INFINITY;
let candidates = [];
let rankedCandidates = [];
let copiedFiles = 0;
let zipContext = null;
let focusMismatchBypassed = false;
let dashboardsResult = null;

if (explicitExportRoot) {
  mode = "explicit_export_root";
  const candidate = toVaultCandidate(explicitExportRoot);
  candidates = [candidate];
  printCandidateTable("Candidate roots (explicit override)", candidates);
  if (!candidate.valid) {
    fail(`CLARUM_EXPORT_ROOT is invalid: ${candidate.reason}. path=${explicitExportRoot}`);
  }
  const selection = chooseCandidateFromList(candidates, {
    explicitRoot: explicitExportRoot,
    focusTracks,
    minReports,
  });
  selected = selection.selected;
  rankedCandidates = selection.ranked ?? [];
  selectionReason = selection.reason;
  selectedScore = selection.selectedScore;
} else if (vaultDir) {
  mode = "vault_dir_discovery";
  if (!fs.existsSync(vaultDir)) {
    fail(`CLARUM_VAULT_DIR does not exist: ${vaultDir}`);
  }

  const roots = discoverCandidateRoots(vaultDir);
  if (roots.length === 0) {
    fail(`No candidate export roots discovered under CLARUM_VAULT_DIR=${vaultDir}`);
  }

  candidates = roots.map((root) => toVaultCandidate(root));
  applyMinReportsConstraint(candidates, minReports);
  printCandidateTable("Candidate roots (vault_dir discovery)", candidates);

  const selection = chooseCandidateFromList(candidates, { focusTracks, minReports });
  selected = selection.selected;
  rankedCandidates = selection.ranked ?? [];
  selectionReason = selection.reason;
  selectedScore = selection.selectedScore;

  if (!selected) {
    fail(
      `No valid export root candidates found under ${vaultDir}. Check candidate table above and rebuild site_export.v1 in vault.`
    );
  }

  const betterFocusCandidate = findBetterFocusCandidate(selected, candidates);
  if ((selected.focusSum ?? 0) === 0 && betterFocusCandidate) {
    if (!allowFocusMismatch) {
      fail(
        `Selected root has zero focus tracks but a better candidate exists.\n` +
          `selected=${selected.root} focus_sum=${selected.focusSum} total_reports=${selected.totalReports} score=${computeCandidateScore(selected)}\n` +
          `better=${betterFocusCandidate.root} focus_sum=${betterFocusCandidate.focusSum} total_reports=${betterFocusCandidate.totalReports} score=${computeCandidateScore(
            betterFocusCandidate
          )}\n` +
          `Set CLARUM_EXPORT_ROOT to the better path, fix CLARUM_VAULT_DIR, or set CLARUM_ALLOW_FOCUS_MISMATCH=1 to bypass.`
      );
    }
    focusMismatchBypassed = true;
    console.warn(
      `[sync] WARN: focus mismatch bypassed by CLARUM_ALLOW_FOCUS_MISMATCH=1. selected=${selected.root}; better=${betterFocusCandidate.root}`
    );
  }
} else {
  if (!allowZipFallback) {
    fail(
      "CLARUM_VAULT_DIR is not set. Set CLARUM_VAULT_DIR, or explicitly allow zip fallback with CLARUM_ALLOW_ZIP_FALLBACK=1."
    );
  }
  if (!fs.existsSync(zipPath)) {
    fail(`Zip fallback requested but zip not found: ${zipPath}`);
  }

  mode = "zip_fallback";
  zipContext = discoverZipCandidates(zipPath);
  candidates = zipContext.candidates;
  applyMinReportsConstraint(candidates, minReports);
  printCandidateTable("Candidate roots (zip_fallback discovery)", candidates);

  const selection = chooseCandidateFromList(candidates, { focusTracks, minReports });
  selected = selection.selected;
  rankedCandidates = selection.ranked ?? [];
  selectionReason = selection.reason;
  selectedScore = selection.selectedScore;

  if (!selected) {
    fail(`No valid export root candidates found inside zip ${zipPath}.`);
  }

  const betterFocusCandidate = findBetterFocusCandidate(selected, candidates);
  if ((selected.focusSum ?? 0) === 0 && betterFocusCandidate) {
    if (!allowFocusMismatch) {
      fail(
        `Selected zip candidate has zero focus tracks but a better candidate exists.\n` +
          `selected=${selected.root} focus_sum=${selected.focusSum} total_reports=${selected.totalReports} score=${computeCandidateScore(selected)}\n` +
          `better=${betterFocusCandidate.root} focus_sum=${betterFocusCandidate.focusSum} total_reports=${betterFocusCandidate.totalReports} score=${computeCandidateScore(
            betterFocusCandidate
          )}\n` +
          `Use CLARUM_EXPORT_ROOT to point to the intended export root, or set CLARUM_ALLOW_FOCUS_MISMATCH=1 to bypass.`
      );
    }
    focusMismatchBypassed = true;
    console.warn(
      `[sync] WARN: focus mismatch bypassed by CLARUM_ALLOW_FOCUS_MISMATCH=1. selected=${selected.root}; better=${betterFocusCandidate.root}`
    );
  }
}

if (!selected || !selected.valid) {
  fail("Unable to determine a valid export root candidate.");
}

fs.rmSync(destDir, {
  recursive: true,
  force: true,
  maxRetries: 5,
  retryDelay: 100,
});
fs.mkdirSync(destDir, { recursive: true });

if (mode === "zip_fallback") {
  copiedFiles = extractZipToDestination(zipContext.zip, selected.zipPrefix, destDir);
} else {
  copiedFiles = copyDirectoryRecursive(selected.root, destDir);
}

if (mode === "zip_fallback") {
  dashboardsResult = {
    mode: "missing",
    source_dir: null,
    files_copied: [],
    files_missing: [...DASHBOARD_TARGET_FILENAMES],
    warnings: ["Dashboards copy skipped for zip fallback mode."],
    candidate_count: 0,
    selected_score: 0,
    selected_reason: "zip_fallback_skipped",
    candidates: [],
  };
} else {
  dashboardsResult = copyDashboardsToDestination(selected.root, destDir);
}

const reportIdAlias = ensureReportIdAlias();
const payloadBackfill = backfillMissingPayloads();
const destValidation = ensureDestinationShape();
const destinationStats = readDestinationStats();

for (const track of focusTracks) {
  const sourceCount = selected.trackCounts?.[track] ?? 0;
  const destinationCount = destinationStats.trackCounts?.[track] ?? 0;
  if (sourceCount > 0 && destinationCount === 0) {
    fail(
      `Destination bundle does not match source for ${track}. source=${sourceCount} destination=${destinationCount}.`
    );
  }
}
const sourceFocusSumForGuard = focusTracks.reduce(
  (sum, track) => sum + Number(selected.trackCounts?.[track] ?? 0),
  0
);
const destinationFocusSumForGuard = focusTracks.reduce(
  (sum, track) => sum + Number(destinationStats.trackCounts?.[track] ?? 0),
  0
);
if (sourceFocusSumForGuard > 0 && destinationFocusSumForGuard === 0) {
  fail(
    `Destination focus-track sum does not match source. source_focus_sum=${sourceFocusSumForGuard} destination_focus_sum=${destinationFocusSumForGuard}.`
  );
}

const warnings = [];
if (focusTracks.some((track) => (selected.trackCounts?.[track] ?? 0) === 0)) {
  warnings.push(
    warningEntry(
      "FOCUS_TRACKS_ZERO",
      "Bundle likely does not include focus tracks or source path is wrong.",
      { focusTracks, focusCounts: selected.focusCounts }
    )
  );
}
if (payloadBackfill.generated > 0) {
  warnings.push(
    warningEntry("PAYLOADS_BACKFILLED", "Payloads were backfilled from report files.", {
      generated: payloadBackfill.generated,
    })
  );
}
if (payloadBackfill.failed > 0) {
  warnings.push(
    warningEntry("PAYLOAD_BACKFILL_FAILED", "Some payload backfills failed.", {
      failed: payloadBackfill.failed,
    })
  );
}

const dashboardsFound = dashboardsResult?.fixed_files_copied?.length ?? 0;
if (dashboardsResult?.mode !== "copied") {
  warnings.push(
    warningEntry("DASHBOARDS_MISSING", "One or more expected dashboards are missing.", {
      expected: DASHBOARD_REL_PATHS.length,
      found: dashboardsFound,
    })
  );
}
if (Array.isArray(dashboardsResult?.warnings) && dashboardsResult.warnings.length > 0) {
  for (const dashboardWarning of dashboardsResult.warnings) {
    warnings.push(
      warningEntry("DASHBOARDS_WARNING", String(dashboardWarning), {
        dashboardsMode: dashboardsResult.mode,
      })
    );
  }
}
if (focusMismatchBypassed) {
  warnings.push(
    warningEntry(
      "FOCUS_MISMATCH_BYPASSED",
      "Selected root has zero focus sum while another candidate has non-zero focus sum; bypass enabled.",
      { env: "CLARUM_ALLOW_FOCUS_MISMATCH=1" }
    )
  );
}

const sourceFocusCounts = Object.fromEntries(
  focusTracks.map((track) => [track, selected.trackCounts?.[track] ?? 0])
);
const destFocusCounts = Object.fromEntries(
  focusTracks.map((track) => [track, destinationStats.trackCounts?.[track] ?? 0])
);
const sourceFocusSum = Object.values(sourceFocusCounts).reduce((sum, value) => sum + Number(value), 0);
const destFocusSum = Object.values(destFocusCounts).reduce((sum, value) => sum + Number(value), 0);

const stamp = {
  syncedAt,
  mode,
  vaultDir: vaultDir ?? null,
  exportRoot: selected.root,
  candidate_count: candidates.length,
  selected_candidate_score: selectedScore,
  selected_candidate_reason: selectionReason,
  best_candidate_score: selectedScore,
  best_candidate_reason: selectionReason,
  sourceReports: selected.totalReports,
  destReports: destinationStats.totalReports,
  total_reports_source: selected.totalReports,
  total_reports_dest: destinationStats.totalReports,
  focusTracks,
  focus_sum_source: sourceFocusSum,
  focus_sum_dest: destFocusSum,
  sourceFocusCounts,
  destFocusCounts,
  focus_track_counts_source: sourceFocusCounts,
  focus_track_counts_dest: destFocusCounts,
  candidatesConsidered: candidates.length,
  selection: {
    reason: selectionReason,
    score: selectedScore,
    totalReports: selected.totalReports,
    trackCounts: selected.trackCounts,
    focusTracks,
    focusCounts: sourceFocusCounts,
    focusSum: sourceFocusSum,
    indexSha256: selected.indexSha256,
  },
  destination: {
    indexSha256: destinationStats.indexSha256,
    totalReports: destinationStats.totalReports,
    trackCounts: destinationStats.trackCounts,
    focusCounts: destFocusCounts,
    focusSum: destFocusSum,
  },
  dashboards: dashboardsResult,
  warnings,
  vaultExportRoot: selected.root,
  sourceReportsIndexPath: selected.reportsPath ?? selected.reportsEntryPath ?? null,
  sourceEvidenceIndexPath: selected.evidencePath ?? selected.evidenceEntryPath ?? null,
  destReportsIndexPath,
  destEvidenceIndexPath: destValidation.evidencePath ?? null,
  sourceIndexSha256: selected.indexSha256,
  destIndexSha256: destinationStats.indexSha256,
  sourceReportCount: selected.totalReports,
  destReportCount: destinationStats.totalReports,
  sourceTrackCounts: selected.trackCounts,
  destTrackCounts: destinationStats.trackCounts,
  focusTrackCounts: Object.fromEntries(
    focusTracks.map((track) => [
      track,
      {
        source: selected.trackCounts?.[track] ?? 0,
        destination: destinationStats.trackCounts?.[track] ?? 0,
      },
    ])
  ),
};

const stampPath = writeSourceStamp(stamp);

console.log("[sync] SOURCE STAMP");
console.log(`[sync] syncedAt=${syncedAt}`);
console.log(`[sync] mode=${mode}`);
console.log(`[sync] CLARUM_VAULT_DIR=${vaultDir ?? "(unset)"}`);
console.log(`[sync] CLARUM_EXPORT_ROOT=${explicitExportRoot ?? "(unset)"}`);
console.log(`[sync] export_root=${selected.root}`);
console.log(`[sync] focus_tracks=${focusTracks.join(",")}`);
console.log(`[sync] selected_candidate_score=${selectedScore}`);
console.log(`[sync] selected_candidate_reason=${selectionReason}`);
console.log(`[sync] source_index_sha256=${shortHash(selected.indexSha256)}`);
console.log(`[sync] dest_index_sha256=${shortHash(destinationStats.indexSha256)}`);
console.log(`[sync] candidates_considered=${candidates.length}`);
console.log(`[sync] copied_files=${copiedFiles}`);
if (reportIdAlias.updated > 0) {
  console.log(`[sync] Added report_id aliases: ${reportIdAlias.updated}`);
}
if (payloadBackfill.generated > 0 || payloadBackfill.failed > 0) {
  console.log(
    `[sync] Backfilled payloads: ${payloadBackfill.generated} generated, ${payloadBackfill.failed} failed`
  );
}
console.log(`[sync] source_reports=${selected.totalReports}`);
console.log(`[sync] destination_reports=${destinationStats.totalReports}`);
console.log(`[sync] focus_sum_source=${sourceFocusSum}`);
console.log(`[sync] focus_sum_destination=${destFocusSum}`);
console.log(`[sync] source_track_counts=${formatTrackCounts(selected.trackCounts)}`);
console.log(`[sync] destination_track_counts=${formatTrackCounts(destinationStats.trackCounts)}`);
console.log(
  `[sync] dashboards mode=${dashboardsResult?.mode ?? "missing"} copied=${dashboardsFound}/${DASHBOARD_REL_PATHS.length}`
);
const dashboardsOptionalCount = dashboardsResult?.optional_files_copied?.length ?? 0;
if (dashboardsOptionalCount > 0) {
  console.log(`[sync] dashboards_optional_copied=${dashboardsOptionalCount}`);
}
if (dashboardsResult?.source_dir) {
  console.log(`[sync] dashboards_source=${dashboardsResult.source_dir}`);
}
console.log(`[sync] source_stamp=${stampPath}`);
if (rankedCandidates.length > 0) {
  const top = rankedCandidates.slice(0, 5);
  for (const candidate of top) {
    const focusSummary = focusTracks
      .map((track) => `${track}:${candidate.focusCounts?.[track] ?? 0}`)
      .join(",");
    console.log(
      `[sync] top_candidate score=${computeCandidateScore(candidate)} reports=${candidate.totalReports} focus_sum=${
        candidate.focusSum
      } root=${candidate.root} focus=[${focusSummary}]`
    );
  }
}

const hasFocusZeroWarning = warnings.some((entry) => entry?.code === "FOCUS_TRACKS_ZERO");
if (hasFocusZeroWarning) {
  console.warn(
    `[sync] WARN: bundle likely does not include focus tracks OR source path is wrong. ${focusTracks
      .map((track) => `${track}=${destinationStats.trackCounts?.[track] ?? 0}`)
      .join(", ")}`
  );
  console.warn(
    `[sync] WARN: first report ids (${Math.min(destinationStats.reportIds.length, 10)}): ${destinationStats.reportIds
      .filter(Boolean)
      .slice(0, 10)
      .join(", ")}`
  );
}
