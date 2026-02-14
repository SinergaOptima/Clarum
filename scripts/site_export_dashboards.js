const fs = require("node:fs");
const path = require("node:path");
const { isExcludedDiscoveryPath } = require("./site_export_selector");

const DASHBOARD_TARGET_FILENAMES = [
  "index.dashboards.v1.json",
  "track_counts_from_export.v1.json",
  "static_usage_report_7c.v1.json",
  "tier_a_backlog_bundle_7c.v1.json",
  "deltas_7c.v1.json",
  "wave_engine_state.v1.json",
  "latest.wave_engine.v1.json",
];

const DASHBOARD_OPTIONAL_PATTERNS = [/^quality_lift_wave.*_summary_7c\.v1\.json$/i];

const DASHBOARD_RELATIVE_CANDIDATES = [
  "dashboards",
  "../../04 - Data & Ontology/Ontology/_machine/dashboards",
  "../_machine/dashboards",
  "../../_machine/dashboards",
];

const DASHBOARD_EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  "fixtures",
  "__fixtures__",
  "public",
]);

function normalizePath(input) {
  return String(input || "").replace(/\\/g, "/");
}

function isDirectory(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function discoverMachineDashboards(rootDir, maxDepth = 6) {
  const found = new Set();
  const stack = [{ dir: rootDir, depth: 0 }];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.depth > maxDepth) continue;
    if (current.depth > 0 && isExcludedDiscoveryPath(current.dir)) continue;

    const normalized = normalizePath(current.dir).toLowerCase();
    if (normalized.endsWith("/_machine/dashboards")) {
      found.add(path.resolve(current.dir));
      continue;
    }

    let entries;
    try {
      entries = fs.readdirSync(current.dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (DASHBOARD_EXCLUDED_DIRS.has(entry.name.toLowerCase())) continue;
      const nextDir = path.join(current.dir, entry.name);
      if (isExcludedDiscoveryPath(nextDir)) continue;
      stack.push({ dir: nextDir, depth: current.depth + 1 });
    }
  }
  return Array.from(found).sort((left, right) => left.localeCompare(right));
}

function evaluateDashboardsDirectory(dirPath) {
  const result = {
    dir: dirPath,
    exists: false,
    fixedMatches: [],
    optionalMatches: [],
    filesMissing: [...DASHBOARD_TARGET_FILENAMES],
    score: 0,
  };

  if (!isDirectory(dirPath)) return result;
  result.exists = true;

  let entries = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return result;
  }

  const fileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  result.fixedMatches = DASHBOARD_TARGET_FILENAMES.filter((fileName) => fileNames.includes(fileName));
  result.filesMissing = DASHBOARD_TARGET_FILENAMES.filter((fileName) => !fileNames.includes(fileName));
  result.optionalMatches = fileNames.filter((fileName) =>
    DASHBOARD_OPTIONAL_PATTERNS.some((pattern) => pattern.test(fileName))
  );
  result.score = result.fixedMatches.length + result.optionalMatches.length;
  return result;
}

function collectDashboardsCandidates(exportRoot) {
  const set = new Set();
  for (const rel of DASHBOARD_RELATIVE_CANDIDATES) {
    set.add(path.resolve(exportRoot, rel));
  }

  const scanStart = path.resolve(exportRoot, "..", "..", "..");
  if (isDirectory(scanStart)) {
    for (const found of discoverMachineDashboards(scanStart, 6)) {
      set.add(found);
    }
  }

  return Array.from(set)
    .map((dir) => evaluateDashboardsDirectory(dir))
    .sort((left, right) => {
      if (left.score !== right.score) return right.score - left.score;
      return left.dir.localeCompare(right.dir);
    });
}

function copyDashboardsToDestination(exportRoot, destinationRoot) {
  const candidates = collectDashboardsCandidates(exportRoot);
  const selected = candidates[0] ?? null;
  const dashboardsDestDir = path.join(destinationRoot, "dashboards");
  const base = {
    mode: "missing",
    source_dir: null,
    files_copied: [],
    fixed_files_copied: [],
    optional_files_copied: [],
    files_missing: [...DASHBOARD_TARGET_FILENAMES],
    warnings: [],
    candidate_count: candidates.length,
    selected_score: selected?.score ?? 0,
    selected_reason: selected ? "best_match" : "no_candidate",
    candidates: candidates.slice(0, 5).map((candidate) => ({
      dir: candidate.dir,
      score: candidate.score,
      fixed_matches: candidate.fixedMatches,
      optional_matches: candidate.optionalMatches,
    })),
  };

  if (!selected || !selected.exists || selected.score === 0) {
    return base;
  }

  try {
    fs.mkdirSync(dashboardsDestDir, { recursive: true });
    const filesToCopy = [...selected.fixedMatches, ...selected.optionalMatches];
    const copied = [];
    const fixedCopied = [];
    const optionalCopied = [];
    for (const fileName of filesToCopy) {
      const sourcePath = path.join(selected.dir, fileName);
      const destinationPath = path.join(dashboardsDestDir, fileName);
      fs.copyFileSync(sourcePath, destinationPath);
      copied.push(fileName);
      if (selected.fixedMatches.includes(fileName)) {
        fixedCopied.push(fileName);
      } else {
        optionalCopied.push(fileName);
      }
    }
    return {
      ...base,
      mode: "copied",
      source_dir: selected.dir,
      files_copied: copied.sort((left, right) => left.localeCompare(right)),
      fixed_files_copied: fixedCopied.sort((left, right) => left.localeCompare(right)),
      optional_files_copied: optionalCopied.sort((left, right) => left.localeCompare(right)),
      files_missing: selected.filesMissing,
      warnings: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...base,
      mode: "error",
      source_dir: selected.dir,
      files_missing: selected.filesMissing,
      warnings: [`Failed to copy dashboards: ${message}`],
    };
  }
}

module.exports = {
  DASHBOARD_TARGET_FILENAMES,
  copyDashboardsToDestination,
  collectDashboardsCandidates,
};
