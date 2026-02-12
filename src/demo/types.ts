export type IndicatorStatus = "present" | "missing" | "partial";

export type Indicator = {
  id: string;
  name: string;
  value: string;
  unit: string;
  year: string;
  source: string;
  status: IndicatorStatus;
};

export type Domain = {
  id: string;
  name: string;
  summary: string;
  indicators: Indicator[];
};

export type Dossier = {
  slug: string;
  title: string;
  country: string;
  region: string;
  topic: string;
  summary: string;
  published: string;
  confidence: number;
  completeness: number;
  keyDrivers: string[];
  warnings: string[];
  nextActions: string[];
  domains: Domain[];
  evidenceIds: string[];
};

export type Evidence = {
  id: string;
  title: string;
  source: string;
  date: string;
  tags: string[];
  summary: string;
  markdown: string;
  dossierSlugs: string[];
};
