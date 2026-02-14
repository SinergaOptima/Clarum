export type ReportIndexEntry = {
  id: string;
  dossier_slug: string;
  country: string;
  track: "export" | "domestic" | string;
  profile_id: string;
  path: string;
  memo_json_path?: string;
  memo_md_path?: string;
  evidence_tier_summary?: Record<string, number>;
  flags?: ReportFlag[];
};

export type ReportIndex = {
  reports: ReportIndexEntry[];
};

export type ReportFlag = {
  id: string;
  indicator_ids: string[];
  summary: string;
};

export type EvidenceIndexEntry = {
  added_at: string | null;
  id: string;
  publication_date: string;
  source_type: string;
  tier: string;
  title: string;
  urls: string[];
};

export type IndicatorStatus = "present" | "partial" | "missing";

export type Indicator = {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  year: string | null;
  source: string;
  status: IndicatorStatus;
  domain?: string;
  sourceInstitution?: string;
  urls?: string[];
  notes?: string;
  isCompleteStrict?: boolean;
  missingValue?: boolean;
  missingUrl?: boolean;
  missingDate?: boolean;
};

export type Domain = {
  id: string;
  name: string;
  summary: string;
  indicators: Indicator[];
  completenessPct?: number;
  inScope?: number;
  complete?: number;
};

export type DossierListItem = {
  id: string;
  slug: string;
  title: string;
  country: string;
  track: "export" | "domestic" | string;
  trackLabel: string;
  trackDescription?: string;
  scenarioKey?: string;
  profileId: string;
  confidenceScore: number;
  completenessScore: number;
  summary: string;
  tierSummary: Record<string, number>;
  flags: ReportFlag[];
};

export type DossierDetail = {
  id: string;
  slug: string;
  title: string;
  country: string;
  track: "export" | "domestic" | string;
  trackLabel: string;
  trackDescription?: string;
  scenarioKey?: string;
  profileId: string;
  confidenceScore: number;
  confidenceCap: string;
  completenessScore: number;
  completenessPct: number;
  profileWeightedCompletenessPct?: number;
  tierSummary: Record<string, number>;
  flags: ReportFlag[];
  confidenceReasons: string[];
  warnings: string[];
  nextActions: string[];
  domains: Domain[];
  evidenceRefs: string[];
  memoJsonPath?: string;
  memoMdPath?: string;
  weightsUsed?: Record<string, number>;
  domainCompleteness?: Record<string, { pct: number; in_scope: number; complete: number }>;
};

export type EvidenceListItem = {
  id: string;
  title: string;
  publicationDate: string;
  sourceType: string;
  tier: string;
  urls: string[];
  summary: string;
  tags: string[];
};

export type EvidenceDetail = {
  item: EvidenceListItem;
  markdown: string;
};
