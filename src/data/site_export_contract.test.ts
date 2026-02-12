/* @vitest-environment node */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const exportRoot = path.resolve("public", "data", "site_export.v1");
const reportsIndexPath = path.join(exportRoot, "index", "index.reports.v1.json");
const evidenceIndexPath = path.join(exportRoot, "evidence", "evidence_index.v1.json");
const missingBundleMessage =
  "Missing site_export bundle. Run `bun run sync-site-export` and ensure `13 - Lattice Labs.zip` is present (or set CLARUM_VAULT_ZIP).";

type JsonObject = Record<string, unknown>;

type ReportIndexEntry = {
  id: string;
  country: string;
  track: string;
  profile_id: string;
  path: string;
  dossier_slug?: string;
  memo_json_path?: string;
  memo_md_path?: string;
};

type ReportScanIssues = {
  missingFiles: string[];
  jsonParseFailures: string[];
  invalidReportsIndexShape: string[];
  invalidReportIndexEntries: string[];
  duplicateReportIds: string[];
};

type EvidenceScanIssues = {
  missingFiles: string[];
  jsonParseFailures: string[];
  invalidEvidenceIndexEntries: string[];
  missingEvidenceIndexEntries: string[];
  missingEvidenceMarkdownForRefs: string[];
  invalidPayloadEvidenceRefs: string[];
};

type ScanResult = {
  bundleMissingMessage: string | null;
  reportIssues: ReportScanIssues;
  evidenceIssues: EvidenceScanIssues;
};

const reportFields: Array<keyof ReportIndexEntry> = [
  "id",
  "country",
  "track",
  "profile_id",
  "path",
];

function toRel(filePath: string) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

function toExportPath(rawPath: string) {
  return path.join(exportRoot, rawPath.replace(/^\/+/, ""));
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonFile(filePath: string, jsonParseFailures: string[]) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    jsonParseFailures.push(`${toRel(filePath)} :: ${message}`);
    return null;
  }
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sortedUnique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function formatFailure(
  title: string,
  sections: Array<{ header: string; items: string[] }>
): string | null {
  const nonEmpty = sections
    .map((section) => ({ header: section.header, items: sortedUnique(section.items) }))
    .filter((section) => section.items.length > 0);

  if (nonEmpty.length === 0) return null;

  const formattedSections = nonEmpty
    .map((section) => `${section.header}:\n${section.items.map((item) => `- ${item}`).join("\n")}`)
    .join("\n\n");

  return `${title}\n\n${formattedSections}`;
}

function scanBundleContract(): ScanResult {
  const reportIssues: ReportScanIssues = {
    missingFiles: [],
    jsonParseFailures: [],
    invalidReportsIndexShape: [],
    invalidReportIndexEntries: [],
    duplicateReportIds: [],
  };

  const evidenceIssues: EvidenceScanIssues = {
    missingFiles: [],
    jsonParseFailures: [],
    invalidEvidenceIndexEntries: [],
    missingEvidenceIndexEntries: [],
    missingEvidenceMarkdownForRefs: [],
    invalidPayloadEvidenceRefs: [],
  };

  if (!fs.existsSync(reportsIndexPath)) {
    return {
      bundleMissingMessage: missingBundleMessage,
      reportIssues,
      evidenceIssues,
    };
  }

  const reportsIndexJson = parseJsonFile(reportsIndexPath, reportIssues.jsonParseFailures);
  let validReportEntries: ReportIndexEntry[] = [];
  const payloadById = new Map<string, JsonObject>();

  if (reportsIndexJson !== null) {
    if (!isJsonObject(reportsIndexJson)) {
      reportIssues.invalidReportsIndexShape.push(
        `${toRel(reportsIndexPath)} :: expected JSON object at top level`
      );
    } else {
      const reportsUnknown = reportsIndexJson.reports;
      if (!Array.isArray(reportsUnknown)) {
        reportIssues.invalidReportsIndexShape.push(
          `${toRel(reportsIndexPath)} :: expected "reports" to be an array`
        );
      } else {
        const seenReportIds = new Set<string>();
        for (let index = 0; index < reportsUnknown.length; index += 1) {
          const rawEntry = reportsUnknown[index];
          if (!isJsonObject(rawEntry)) {
            reportIssues.invalidReportIndexEntries.push(
              `reports[${index}] :: expected object entry`
            );
            continue;
          }

          const missingFieldNames = reportFields.filter((field) => !hasString(rawEntry[field]));
          if (missingFieldNames.length > 0) {
            reportIssues.invalidReportIndexEntries.push(
              `reports[${index}] :: missing required field(s): ${missingFieldNames.join(", ")}`
            );
            continue;
          }

          if (
            rawEntry.dossier_slug !== undefined &&
            rawEntry.dossier_slug !== null &&
            typeof rawEntry.dossier_slug !== "string"
          ) {
            reportIssues.invalidReportIndexEntries.push(
              `reports[${index}] :: dossier_slug must be a string when present`
            );
          }

          if (
            rawEntry.memo_json_path !== undefined &&
            rawEntry.memo_json_path !== null &&
            typeof rawEntry.memo_json_path !== "string"
          ) {
            reportIssues.invalidReportIndexEntries.push(
              `reports[${index}] :: memo_json_path must be a string when present`
            );
          }

          if (
            rawEntry.memo_md_path !== undefined &&
            rawEntry.memo_md_path !== null &&
            typeof rawEntry.memo_md_path !== "string"
          ) {
            reportIssues.invalidReportIndexEntries.push(
              `reports[${index}] :: memo_md_path must be a string when present`
            );
          }

          const entry: ReportIndexEntry = {
            id: rawEntry.id,
            country: rawEntry.country,
            track: rawEntry.track,
            profile_id: rawEntry.profile_id,
            path: rawEntry.path,
            dossier_slug:
              typeof rawEntry.dossier_slug === "string" ? rawEntry.dossier_slug : undefined,
            memo_json_path:
              typeof rawEntry.memo_json_path === "string" ? rawEntry.memo_json_path : undefined,
            memo_md_path:
              typeof rawEntry.memo_md_path === "string" ? rawEntry.memo_md_path : undefined,
          };

          if (seenReportIds.has(entry.id)) {
            reportIssues.duplicateReportIds.push(entry.id);
          }
          seenReportIds.add(entry.id);

          validReportEntries.push(entry);
        }
      }
    }
  }

  validReportEntries = validReportEntries.sort((a, b) => a.id.localeCompare(b.id));

  for (const entry of validReportEntries) {
    const reportArtifactPath = toExportPath(entry.path);
    if (!fs.existsSync(reportArtifactPath)) {
      reportIssues.missingFiles.push(toRel(reportArtifactPath));
    } else {
      const reportArtifactJson = parseJsonFile(reportArtifactPath, reportIssues.jsonParseFailures);
      if (reportArtifactJson !== null && !isJsonObject(reportArtifactJson)) {
        reportIssues.invalidReportIndexEntries.push(
          `${toRel(reportArtifactPath)} :: expected report artifact JSON object`
        );
      }
    }

    const payloadPath = path.join(exportRoot, "index", `${entry.id}.payload.v1.json`);
    if (!fs.existsSync(payloadPath)) {
      reportIssues.missingFiles.push(toRel(payloadPath));
    } else {
      const payloadJson = parseJsonFile(payloadPath, reportIssues.jsonParseFailures);
      if (payloadJson !== null) {
        if (!isJsonObject(payloadJson)) {
          reportIssues.invalidReportIndexEntries.push(
            `${toRel(payloadPath)} :: expected payload JSON object`
          );
        } else {
          payloadById.set(entry.id, payloadJson);
        }
      }
    }

    if (entry.memo_json_path) {
      const memoJsonPath = toExportPath(entry.memo_json_path);
      if (!fs.existsSync(memoJsonPath)) {
        reportIssues.missingFiles.push(toRel(memoJsonPath));
      } else {
        const memoJson = parseJsonFile(memoJsonPath, reportIssues.jsonParseFailures);
        if (memoJson !== null && !isJsonObject(memoJson)) {
          reportIssues.invalidReportIndexEntries.push(
            `${toRel(memoJsonPath)} :: expected memo JSON object`
          );
        }
      }
    }

    if (entry.memo_md_path) {
      const memoMarkdownPath = toExportPath(entry.memo_md_path);
      if (!fs.existsSync(memoMarkdownPath)) {
        reportIssues.missingFiles.push(toRel(memoMarkdownPath));
      }
    }
  }

  const evidenceIds = new Set<string>();
  if (!fs.existsSync(evidenceIndexPath)) {
    evidenceIssues.missingFiles.push(toRel(evidenceIndexPath));
  } else {
    const evidenceIndexJson = parseJsonFile(evidenceIndexPath, evidenceIssues.jsonParseFailures);
    if (evidenceIndexJson !== null) {
      if (!Array.isArray(evidenceIndexJson)) {
        evidenceIssues.invalidEvidenceIndexEntries.push(
          `${toRel(evidenceIndexPath)} :: expected top-level array`
        );
      } else {
        for (let index = 0; index < evidenceIndexJson.length; index += 1) {
          const rawEvidenceEntry = evidenceIndexJson[index];
          if (!isJsonObject(rawEvidenceEntry) || !hasString(rawEvidenceEntry.id)) {
            evidenceIssues.invalidEvidenceIndexEntries.push(
              `evidence_index[${index}] :: missing required string field "id"`
            );
            continue;
          }
          const evidenceId = rawEvidenceEntry.id.trim();
          evidenceIds.add(evidenceId);
          const evidenceMarkdownPath = path.join(exportRoot, "evidence", `${evidenceId}.md`);
          if (!fs.existsSync(evidenceMarkdownPath)) {
            evidenceIssues.missingFiles.push(toRel(evidenceMarkdownPath));
          }
        }
      }
    }
  }

  for (const reportId of Array.from(payloadById.keys()).sort((a, b) => a.localeCompare(b))) {
    const payloadJson = payloadById.get(reportId);
    if (!payloadJson) continue;
    const refs = payloadJson.evidence_refs;
    if (refs === undefined || refs === null) continue;

    if (!Array.isArray(refs)) {
      evidenceIssues.invalidPayloadEvidenceRefs.push(
        `${reportId} :: payload.evidence_refs must be an array when present`
      );
      continue;
    }

    for (const rawRef of refs) {
      if (!hasString(rawRef)) {
        evidenceIssues.invalidPayloadEvidenceRefs.push(
          `${reportId} :: payload.evidence_refs contains a non-string/blank value`
        );
        continue;
      }

      const refId = rawRef.trim();
      if (!evidenceIds.has(refId)) {
        evidenceIssues.missingEvidenceIndexEntries.push(`${reportId} -> ${refId}`);
      }

      const evidenceMarkdownPath = path.join(exportRoot, "evidence", `${refId}.md`);
      if (!fs.existsSync(evidenceMarkdownPath)) {
        evidenceIssues.missingEvidenceMarkdownForRefs.push(`${reportId} -> ${toRel(evidenceMarkdownPath)}`);
      }
    }
  }

  return {
    bundleMissingMessage: null,
    reportIssues,
    evidenceIssues,
  };
}

describe("site_export bundle contract", () => {
  it("validates report index + report artifact references", () => {
    const scan = scanBundleContract();
    if (scan.bundleMissingMessage) {
      expect.fail(scan.bundleMissingMessage);
    }

    const failureMessage = formatFailure("site_export report contract failed.", [
      { header: "MISSING_FILES", items: scan.reportIssues.missingFiles },
      { header: "JSON_PARSE_FAILURES", items: scan.reportIssues.jsonParseFailures },
      { header: "INVALID_REPORTS_INDEX_SHAPE", items: scan.reportIssues.invalidReportsIndexShape },
      { header: "INVALID_REPORT_INDEX_ENTRIES", items: scan.reportIssues.invalidReportIndexEntries },
      { header: "DUPLICATE_REPORT_IDS", items: scan.reportIssues.duplicateReportIds },
    ]);

    if (failureMessage) {
      expect.fail(failureMessage);
    }
  });

  it("validates evidence index + payload evidence references", () => {
    const scan = scanBundleContract();
    if (scan.bundleMissingMessage) {
      expect.fail(scan.bundleMissingMessage);
    }

    const failureMessage = formatFailure("site_export evidence contract failed.", [
      { header: "MISSING_FILES", items: scan.evidenceIssues.missingFiles },
      { header: "JSON_PARSE_FAILURES", items: scan.evidenceIssues.jsonParseFailures },
      { header: "INVALID_EVIDENCE_INDEX_ENTRIES", items: scan.evidenceIssues.invalidEvidenceIndexEntries },
      { header: "MISSING_EVIDENCE_INDEX_ENTRIES", items: scan.evidenceIssues.missingEvidenceIndexEntries },
      { header: "MISSING_EVIDENCE_MARKDOWN_FOR_REFS", items: scan.evidenceIssues.missingEvidenceMarkdownForRefs },
      { header: "INVALID_PAYLOAD_EVIDENCE_REFS", items: scan.evidenceIssues.invalidPayloadEvidenceRefs },
    ]);

    if (failureMessage) {
      expect.fail(failureMessage);
    }
  });
});
