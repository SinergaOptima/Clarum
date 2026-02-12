import type {
  Domain,
  DossierDetail,
  DossierListItem,
  EvidenceDetail,
  EvidenceIndexEntry,
  EvidenceListItem,
  Indicator,
  ReportFlag,
  ReportIndex,
  ReportIndexEntry,
} from "@/data/types";
import {
  dossiers as demoDossiers,
  evidence as demoEvidence,
  getEvidenceById as getDemoEvidenceById,
  getEvidenceForDossier as getDemoEvidenceForDossier,
} from "@/demo/data";

type ReportIndicator = {
  value?: string | number;
  unit?: string;
  retrieved_date?: string | null;
  source_institution?: string;
  source?: string;
  urls?: string[] | string;
  url?: string;
  source_url?: string;
  notes?: string;
  is_complete_strict?: boolean;
  missing_value?: boolean;
  missing_url?: boolean;
  missing_date?: boolean;
  domain?: string;
};

type ReportArtifact = {
  meta?: {
    case?: { case_id?: string };
    evidence_tier_summary?: Record<string, number>;
  };
  confidence?: { overall_cap?: string; reasons?: string[] };
  completeness?: {
    overall_pct?: number;
    domain_breakdown?: Record<string, { pct: number; in_scope: number; complete: number }>;
  };
  indicators?: Record<string, ReportIndicator>;
  scores?: { domains?: Record<string, { reason?: string }> };
  warnings?: string[];
  next_actions?: string[];
};

type ReportPayloadIndicator = {
  id: string;
  label?: string;
  value?: string | number;
  unit?: string;
  year?: string | null;
  source_institution?: string;
  domain?: string;
  urls?: string[] | string;
  notes?: string;
  is_complete_strict?: boolean;
  missing_value?: boolean;
  missing_url?: boolean;
  missing_date?: boolean;
};

type ReportPayload = {
  meta?: { title?: string; case_id?: string };
  confidence?: { overall_cap?: string };
  completeness?: {
    overall_pct?: number;
    profile_weighted_pct?: number;
    weights_used?: Record<string, number>;
    domain_breakdown?: Record<string, { pct: number; in_scope: number; complete: number }>;
  };
  indicators?: ReportPayloadIndicator[];
  evidence_refs?: string[];
};

const EXPORT_URL_BASE = "/data/site_export.v1";
const REPORTS_INDEX_PATH = "index/index.reports.v1.json";
const EVIDENCE_INDEX_PATH = "evidence/evidence_index.v1.json";

type DossierMemo = {
  markdown: string | null;
  json: Record<string, unknown> | null;
  markdownError?: string;
  jsonError?: string;
};

const domainLabels: Record<string, { name: string; summary: string }> = {
  A1: { name: "Market Access", summary: "Regulatory access and permitting exposure." },
  A2: { name: "Geopolitics", summary: "Trade, sanctions, and geopolitical alignment." },
  A3: { name: "Policy", summary: "Industrial policy and investment constraints." },
  A4: { name: "Infrastructure", summary: "Logistics, power, and operating friction." },
  A5: { name: "Supply Base", summary: "Supplier depth and manufacturing capacity." },
  A6: { name: "Labor", summary: "Workforce capability and talent constraints." },
  A7: { name: "Capital", summary: "Financial and macro stability signals." },
  A8: { name: "ESG", summary: "Sustainability and governance exposure." },
};

const indicatorNameOverrides: Record<string, string> = {
  "IND-A1-REG-001": "Regulatory Quality Estimate",
  "IND-A1-REG-002": "Rule of Law Estimate",
  "IND-A4-INF-001": "LPI - Logistics Performance Index",
  "IND-A6-LAB-001": "Human Capital Index",
  "IND-A8-ESG-001": "Corruption Perceptions Index",
  "IND-A8-ESG-002": "Environmental Performance Index",
  "IND-A8-ESG-004": "Control of Corruption",
};

const confidenceScoreMap: Record<string, number> = {
  low: 0.33,
  medium: 0.66,
  high: 0.9,
};

function isServer() {
  return typeof window === "undefined";
}

async function getServerExportRoot() {
  const path = await import("node:path");
  return path.join(process.cwd(), "public", "data", "site_export.v1");
}

async function readJsonServer<T>(relativePath: string): Promise<T> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = await getServerExportRoot();
  const fullPath = path.join(root, relativePath);
  const raw = await fs.readFile(fullPath, "utf8");
  return JSON.parse(raw) as T;
}

async function readTextServer(relativePath: string): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = await getServerExportRoot();
  const fullPath = path.join(root, relativePath);
  return fs.readFile(fullPath, "utf8");
}

async function serverFileExists(relativePath: string): Promise<boolean> {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = await getServerExportRoot();
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function fetchJson<T>(relativePath: string): Promise<T> {
  const res = await fetch(`${EXPORT_URL_BASE}/${relativePath}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${relativePath}`);
  }
  return (await res.json()) as T;
}

async function fetchText(relativePath: string): Promise<string> {
  const res = await fetch(`${EXPORT_URL_BASE}/${relativePath}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${relativePath}`);
  }
  return res.text();
}

async function readJson<T>(relativePath: string): Promise<T> {
  if (isServer()) {
    return readJsonServer<T>(relativePath);
  }
  return fetchJson<T>(relativePath);
}

async function readText(relativePath: string): Promise<string> {
  if (isServer()) {
    return readTextServer(relativePath);
  }
  return fetchText(relativePath);
}

function normalizeExportPath(rawPath?: string | null) {
  if (!rawPath) return null;
  const trimmed = rawPath.replace(/^\/+/, "");
  return trimmed.replace(/^data\/site_export\.v1\//, "");
}

export async function getDossierMemo(
  memoMdPath?: string | null,
  memoJsonPath?: string | null
): Promise<DossierMemo> {
  const markdownPath = normalizeExportPath(memoMdPath);
  const jsonPath = normalizeExportPath(memoJsonPath);

  if (!markdownPath && !jsonPath) {
    return { markdown: null, json: null };
  }

  let markdown: string | null = null;
  let json: Record<string, unknown> | null = null;
  let markdownError: string | undefined;
  let jsonError: string | undefined;

  if (markdownPath) {
    try {
      markdown = await readText(markdownPath);
    } catch {
      markdownError = "Memo markdown failed to load.";
    }
  }

  if (jsonPath) {
    try {
      json = await readJson<Record<string, unknown>>(jsonPath);
    } catch {
      jsonError = "Memo metadata failed to load.";
    }
  }

  return { markdown, json, markdownError, jsonError };
}

export async function isExportBundleAvailable(): Promise<boolean> {
  if (isServer()) {
    return serverFileExists(REPORTS_INDEX_PATH);
  }
  try {
    const res = await fetch(`${EXPORT_URL_BASE}/${REPORTS_INDEX_PATH}`, {
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getAllReportsIndex(): Promise<ReportIndex> {
  return readJson<ReportIndex>(REPORTS_INDEX_PATH);
}

export async function getAllEvidenceIndex(): Promise<EvidenceIndexEntry[]> {
  return readJson<EvidenceIndexEntry[]>(EVIDENCE_INDEX_PATH);
}

function normalizeTrackLabel(track: string) {
  return track.toLowerCase() === "domestic" ? "Domestic" : "Export";
}

function resolveEntrySlug(entry: ReportIndexEntry) {
  if (entry.dossier_slug) return entry.dossier_slug;
  if (entry.id) return entry.id;
  const fromPath = entry.path?.split("/").pop()?.replace(".report.v1.json", "");
  return fromPath ?? "";
}

function summarizeTier(tierSummary?: Record<string, number>) {
  const summary = tierSummary ?? {};
  const aCount = summary.A ?? 0;
  const bCount = summary.B ?? 0;
  return `Tier A: ${aCount} · Tier B: ${bCount}`;
}

function fallbackTitle(entry: ReportIndexEntry) {
  const track = normalizeTrackLabel(entry.track);
  return `${entry.country} ${track} dossier`;
}

async function tryReadPayload(entryId: string) {
  const payloadPath = `index/${entryId}.payload.v1.json`;
  try {
    if (isServer()) {
      const exists = await serverFileExists(payloadPath);
      if (!exists) return null;
    }
    return await readJson<Record<string, unknown>>(payloadPath);
  } catch {
    return null;
  }
}

function normalizeIndicatorStatus(indicator: {
  is_complete_strict?: boolean;
  missing_value?: boolean;
  missing_url?: boolean;
  missing_date?: boolean;
}) {
  if (indicator.missing_value || indicator.missing_url || indicator.missing_date) return "missing";
  if (indicator.is_complete_strict === false) return "partial";
  return "present";
}

function normalizeUrlList(value?: string | string[]) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}

function normalizeIndicatorYear(value?: string | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isBlankIndicatorValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string") return false;
  return value.trim().length === 0;
}

function mapIndicatorsFromPayload(payload: ReportPayload): Indicator[] {
  if (!payload?.indicators) return [];
  return payload.indicators.map((indicator) => ({
    id: indicator.id,
    name: indicator.label ?? indicatorNameOverrides[indicator.id] ?? indicator.id,
    value: indicator.value ?? "",
    unit: indicator.unit ?? "",
    year: normalizeIndicatorYear(indicator.year),
    source: indicator.source_institution ?? "",
    status: normalizeIndicatorStatus(indicator),
    domain: indicator.domain,
    sourceInstitution: indicator.source_institution ?? "",
    urls: normalizeUrlList(indicator.urls),
    notes: indicator.notes ?? "",
    isCompleteStrict: indicator.is_complete_strict,
    missingValue: indicator.missing_value,
    missingUrl: indicator.missing_url,
    missingDate: indicator.missing_date,
  }));
}

function mapIndicatorsFromReport(report: ReportArtifact): Indicator[] {
  const indicators = report?.indicators ?? {};
  const entries = Object.entries(indicators) as [string, ReportIndicator][];
  return entries.map(([id, indicator]) => ({
    id,
    name: indicatorNameOverrides[id] ?? id,
    value: indicator.value ?? "",
    unit: indicator.unit ?? "",
    year: normalizeIndicatorYear(indicator.retrieved_date),
    source: indicator.source_institution ?? indicator.source ?? "",
    status: normalizeIndicatorStatus(indicator),
    domain: indicator.domain,
    sourceInstitution: indicator.source_institution ?? indicator.source ?? "",
    urls: normalizeUrlList(indicator.urls ?? indicator.url ?? indicator.source_url),
    notes: indicator.notes ?? "",
    isCompleteStrict: indicator.is_complete_strict,
    missingValue: indicator.missing_value,
    missingUrl: indicator.missing_url,
    missingDate: indicator.missing_date,
  }));
}

function mergeIndicators(
  preferredIndicators: Indicator[],
  fallbackIndicators: Indicator[]
): Indicator[] {
  if (preferredIndicators.length === 0) return fallbackIndicators;
  if (fallbackIndicators.length === 0) return preferredIndicators;

  const fallbackById = new Map(fallbackIndicators.map((indicator) => [indicator.id, indicator]));
  const merged = preferredIndicators.map((indicator) => {
    const fallback = fallbackById.get(indicator.id);
    if (!fallback) return indicator;

    return {
      ...fallback,
      ...indicator,
      name: indicator.name || fallback.name,
      value: isBlankIndicatorValue(indicator.value) ? fallback.value : indicator.value,
      unit: indicator.unit || fallback.unit,
      year: indicator.year ?? fallback.year,
      source: indicator.source || fallback.source,
      domain: indicator.domain ?? fallback.domain,
      sourceInstitution: indicator.sourceInstitution || fallback.sourceInstitution,
      urls: indicator.urls && indicator.urls.length > 0 ? indicator.urls : fallback.urls,
      notes: indicator.notes || fallback.notes,
      isCompleteStrict: indicator.isCompleteStrict ?? fallback.isCompleteStrict,
      missingValue: indicator.missingValue ?? fallback.missingValue,
      missingUrl: indicator.missingUrl ?? fallback.missingUrl,
      missingDate: indicator.missingDate ?? fallback.missingDate,
    };
  });

  const preferredIds = new Set(preferredIndicators.map((indicator) => indicator.id));
  for (const indicator of fallbackIndicators) {
    if (!preferredIds.has(indicator.id)) {
      merged.push(indicator);
    }
  }

  return merged;
}

function groupIndicators(indicators: Indicator[]): Record<string, Indicator[]> {
  return indicators.reduce(
    (acc, indicator) => {
      const domain = indicator.domain ?? indicator.id.split("-")[1] ?? "A1";
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(indicator);
      return acc;
    },
    {} as Record<string, Indicator[]>
  );
}

function buildDomains(
  indicators: Indicator[],
  domainReasons?: Record<string, { reason?: string }>,
  domainCompleteness?: Record<string, { pct: number; in_scope: number; complete: number }>
): Domain[] {
  const grouped = groupIndicators(indicators);
  return Object.keys(grouped).map((domainId) => ({
    id: domainId,
    name: domainLabels[domainId]?.name ?? domainId,
    summary: domainReasons?.[domainId]?.reason ?? domainLabels[domainId]?.summary ?? "",
    indicators: grouped[domainId],
    completenessPct: domainCompleteness?.[domainId]?.pct,
    inScope: domainCompleteness?.[domainId]?.in_scope,
    complete: domainCompleteness?.[domainId]?.complete,
  }));
}

function normalizeFlags(flags?: ReportFlag[]) {
  return flags ?? [];
}

function normalizeEvidenceListItem(entry: EvidenceIndexEntry): EvidenceListItem {
  const tags = [entry.source_type, `Tier ${entry.tier}`];
  return {
    id: entry.id,
    title: entry.title,
    publicationDate: entry.publication_date,
    sourceType: entry.source_type,
    tier: entry.tier,
    urls: entry.urls,
    summary: `${entry.source_type} · Tier ${entry.tier}`,
    tags,
  };
}

export async function getAllDossiers(): Promise<DossierListItem[]> {
  const exportAvailable = await isExportBundleAvailable();
  if (!exportAvailable) {
    return demoDossiers.map((dossier) => ({
      id: dossier.slug,
      slug: dossier.slug,
      title: dossier.title,
      country: dossier.country,
      track: "export",
      trackLabel: "Export",
      profileId: dossier.topic,
      confidenceScore: dossier.confidence,
      completenessScore: dossier.completeness,
      summary: dossier.summary,
      tierSummary: { A: 0, B: 0 },
      flags: [],
    }));
  }

  try {
    const index = await getAllReportsIndex();
    const results: DossierListItem[] = [];

    for (const entry of index.reports) {
      const payload = (await tryReadPayload(entry.id)) as ReportPayload | null;
      const report = payload ? null : await readJson<ReportArtifact>(entry.path);
      const title = payload?.meta?.title ?? report?.meta?.case?.case_id ?? fallbackTitle(entry);
      const confidenceScore =
        confidenceScoreMap[
          payload?.confidence?.overall_cap ?? report?.confidence?.overall_cap ?? ""
        ] ?? 0.5;
      const completenessPct =
        payload?.completeness?.overall_pct ?? report?.completeness?.overall_pct ?? 0;

      results.push({
        id: entry.id,
        slug: resolveEntrySlug(entry),
        title,
        country: entry.country,
        track: entry.track,
        trackLabel: normalizeTrackLabel(entry.track),
        profileId: entry.profile_id,
        confidenceScore,
        completenessScore: completenessPct / 100,
        summary: summarizeTier(entry.evidence_tier_summary),
        tierSummary: entry.evidence_tier_summary ?? report?.meta?.evidence_tier_summary ?? {},
        flags: normalizeFlags(entry.flags),
      });
    }

    return results;
  } catch {
    return demoDossiers.map((dossier) => ({
      id: dossier.slug,
      slug: dossier.slug,
      title: dossier.title,
      country: dossier.country,
      track: "export",
      trackLabel: "Export",
      profileId: dossier.topic,
      confidenceScore: dossier.confidence,
      completenessScore: dossier.completeness,
      summary: dossier.summary,
      tierSummary: { A: 0, B: 0 },
      flags: [],
    }));
  }
}

export async function getDossier(slug: string): Promise<DossierDetail | null> {
  const exportAvailable = await isExportBundleAvailable();
  if (!exportAvailable) {
    const dossier = demoDossiers.find((item) => item.slug === slug);
    if (!dossier) return null;
    return {
      id: dossier.slug,
      slug: dossier.slug,
      title: dossier.title,
      country: dossier.country,
      track: "export",
      trackLabel: "Export",
      profileId: dossier.topic,
      confidenceScore: dossier.confidence,
      confidenceCap: "demo",
      completenessScore: dossier.completeness,
      completenessPct: dossier.completeness * 100,
      tierSummary: { A: 0, B: 0 },
      flags: [],
      confidenceReasons: [],
      warnings: dossier.warnings,
      nextActions: dossier.nextActions,
      domains: dossier.domains as Domain[],
      evidenceRefs: getDemoEvidenceForDossier(dossier.slug).map((item) => item.id),
    };
  }

  try {
    const index = await getAllReportsIndex();
    const entry = index.reports.find((item) => {
      const entrySlug = resolveEntrySlug(item);
      return entrySlug === slug || item.id === slug;
    });
    if (!entry) return null;

    const report = await readJson<ReportArtifact>(entry.path);
    const payload = (await tryReadPayload(entry.id)) as ReportPayload | null;
    const payloadCompleteness = payload?.completeness;

    const title = payload?.meta?.title ?? report?.meta?.case?.case_id ?? fallbackTitle(entry);
    const confidenceCap = report?.confidence?.overall_cap ?? "unknown";
    const confidenceScore = confidenceScoreMap[confidenceCap] ?? 0.5;
    const completenessPct =
      payloadCompleteness?.overall_pct ?? report?.completeness?.overall_pct ?? 0;
    const profileWeightedCompletenessPct = payloadCompleteness?.profile_weighted_pct;
    const tierSummary = report?.meta?.evidence_tier_summary ?? entry.evidence_tier_summary ?? {};
    const payloadIndicators = payload ? mapIndicatorsFromPayload(payload) : [];
    const reportIndicators = mapIndicatorsFromReport(report);
    const indicators = mergeIndicators(payloadIndicators, reportIndicators);

    const domainReasons = report?.scores?.domains ?? {};
    const domainCompleteness =
      payloadCompleteness?.domain_breakdown ?? report?.completeness?.domain_breakdown;
    const domains = buildDomains(indicators, domainReasons, domainCompleteness);

    const confidenceReasons = report?.confidence?.reasons ?? [];
    const warnings = report?.warnings ?? [];
    const nextActions = report?.next_actions ?? [];
    const evidenceRefs = payload?.evidence_refs ?? [];
    const weightsUsed = payloadCompleteness?.weights_used;

    return {
      id: entry.id,
      slug: resolveEntrySlug(entry),
      title,
      country: entry.country,
      track: entry.track,
      trackLabel: normalizeTrackLabel(entry.track),
      profileId: entry.profile_id,
      confidenceScore,
      confidenceCap,
      completenessScore: completenessPct / 100,
      completenessPct,
      profileWeightedCompletenessPct,
      tierSummary,
      flags: normalizeFlags(entry.flags),
      confidenceReasons,
      warnings,
      nextActions,
      domains,
      evidenceRefs,
      memoJsonPath: entry.memo_json_path,
      memoMdPath: entry.memo_md_path,
      weightsUsed,
      domainCompleteness,
    };
  } catch {
    return null;
  }
}

export async function getEvidence(id: string): Promise<EvidenceDetail | null> {
  const exportAvailable = await isExportBundleAvailable();
  if (!exportAvailable) {
    const item = getDemoEvidenceById(id);
    if (!item) return null;
    return {
      item: {
        id: item.id,
        title: item.title,
        publicationDate: item.date,
        sourceType: item.source,
        tier: "Demo",
        urls: [],
        summary: item.summary,
        tags: item.tags,
      },
      markdown: item.markdown,
    };
  }

  try {
    const index = await getAllEvidenceIndex();
    const entry = index.find((item) => item.id === id);
    if (!entry) return null;
    const markdown = await readText(`evidence/${id}.md`);

    return {
      item: normalizeEvidenceListItem(entry),
      markdown,
    };
  } catch {
    return null;
  }
}

export async function getAllEvidenceList(): Promise<EvidenceListItem[]> {
  const exportAvailable = await isExportBundleAvailable();
  if (!exportAvailable) {
    return demoEvidence.map((item) => ({
      id: item.id,
      title: item.title,
      publicationDate: item.date,
      sourceType: item.source,
      tier: "Demo",
      urls: [],
      summary: item.summary,
      tags: item.tags,
    }));
  }

  try {
    const index = await getAllEvidenceIndex();
    return index.map(normalizeEvidenceListItem);
  } catch {
    return demoEvidence.map((item) => ({
      id: item.id,
      title: item.title,
      publicationDate: item.date,
      sourceType: item.source,
      tier: "Demo",
      urls: [],
      summary: item.summary,
      tags: item.tags,
    }));
  }
}

export async function getEvidenceBacklinks(id: string): Promise<DossierListItem[]> {
  const exportAvailable = await isExportBundleAvailable();
  if (!exportAvailable) {
    return demoDossiers
      .filter((dossier) => dossier.evidenceIds.includes(id))
      .map((dossier) => ({
        id: dossier.slug,
        slug: dossier.slug,
        title: dossier.title,
        country: dossier.country,
        track: "export",
        trackLabel: "Export",
        profileId: dossier.topic,
        confidenceScore: dossier.confidence,
        completenessScore: dossier.completeness,
        summary: dossier.summary,
        tierSummary: { A: 0, B: 0 },
        flags: [],
      }));
  }

  try {
    const index = await getAllReportsIndex();
    const dossiers: DossierListItem[] = [];

    for (const entry of index.reports) {
      const payload = (await tryReadPayload(entry.id)) as ReportPayload | null;
      const evidenceRefs = payload?.evidence_refs ?? [];
      if (!evidenceRefs.includes(id)) continue;

      const title = payload?.meta?.title ?? payload?.meta?.case_id ?? fallbackTitle(entry);

      dossiers.push({
        id: entry.id,
        slug: resolveEntrySlug(entry),
        title,
        country: entry.country,
        track: entry.track,
        trackLabel: normalizeTrackLabel(entry.track),
        profileId: entry.profile_id,
        confidenceScore: confidenceScoreMap[payload?.confidence?.overall_cap ?? ""] ?? 0.5,
        completenessScore: (payload?.completeness?.overall_pct ?? 0) / 100,
        summary: summarizeTier(entry.evidence_tier_summary),
        tierSummary: entry.evidence_tier_summary ?? {},
        flags: normalizeFlags(entry.flags),
      });
    }

    return dossiers;
  } catch {
    return [];
  }
}
