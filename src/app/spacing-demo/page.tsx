import { DossierCard } from "@/components/DossierCard";
import { EvidenceCard } from "@/components/EvidenceCard";
import { Hero } from "@/components/Hero";
import { IndicatorTable } from "@/components/IndicatorTable";
import { InfoPanel } from "@/components/InfoPanel";
import { SectionHeader } from "@/components/SectionHeader";
import type { DossierListItem, EvidenceListItem, Indicator } from "@/data/types";

const demoDossiers: DossierListItem[] = [
  {
    id: "demo-hun-ev",
    slug: "demo-hun-ev",
    title: "Hungary EV OEM Export Readiness",
    country: "Hungary",
    track: "export",
    trackLabel: "Export",
    profileId: "WP-EV-OEM-EXPORT-1.1",
    confidenceScore: 0.72,
    completenessScore: 0.68,
    summary: "Export infrastructure is strong, with policy gaps around battery recycling.",
    tierSummary: { A: 12, B: 2 },
    flags: [],
  },
  {
    id: "demo-mex-ev",
    slug: "demo-mex-ev",
    title: "Mexico EV OEM Export Corridor",
    country: "Mexico",
    track: "export",
    trackLabel: "Export",
    profileId: "WP-EV-OEM-EXPORT-1.1",
    confidenceScore: 0.62,
    completenessScore: 0.54,
    summary: "Manufacturing depth is high, while logistics throughput remains constrained.",
    tierSummary: { A: 9, B: 4 },
    flags: [],
  },
];

const demoEvidence: EvidenceListItem[] = [
  {
    id: "EV-2026-001",
    title: "Political Stability and Absence of Violence",
    publicationDate: "2026",
    sourceType: "Dataset",
    tier: "A",
    urls: ["https://api.worldbank.org/v2/indicator/PV.EST?format=json"],
    summary: "World Bank governance indicator for political stability.",
    tags: ["World Bank", "Tier A"],
  },
  {
    id: "EV-2026-007",
    title: "Average time to clear exports through customs",
    publicationDate: "2026",
    sourceType: "Dataset",
    tier: "A",
    urls: ["https://api.worldbank.org/v2/indicator/IC.CUS.DURS.EX?format=json"],
    summary: "Customs throughput proxy for logistics efficiency.",
    tags: ["Customs", "Tier A"],
  },
];

const demoIndicators: Indicator[] = [
  {
    id: "IND-A1-REG-001",
    name: "Regulatory Quality Estimate",
    value: 0.31,
    unit: "Score",
    year: "2023",
    source: "World Bank (WGI)",
    status: "present",
    sourceInstitution: "World Bank (WGI)",
    urls: ["https://api.worldbank.org/v2/country/HUN/indicator/RQ.EST?format=json"],
    notes: "Latest non-null 2023 value.",
  },
  {
    id: "IND-A2-GEO-001",
    name: "Trade Openness Index",
    value: 46.5,
    unit: "% GDP",
    year: "2024",
    source: "World Bank / WTO",
    status: "present",
    sourceInstitution: "World Bank / WTO",
    urls: ["https://api.worldbank.org/v2/indicator/NE.TRD.GNFS.ZS?format=json"],
  },
  {
    id: "IND-A4-INF-003",
    name: "Industrial Electricity Price Volatility",
    value: "TODO",
    unit: "Variance",
    year: "2024",
    source: "IEA",
    status: "missing",
    missingValue: true,
    missingUrl: true,
    missingDate: true,
  },
];

export default function SpacingDemoPage() {
  return (
    <div className="page-shell section-y text-sm">
      <section>
        <div className="section-label">Spacing demo</div>
        <Hero
          title="Editorial layout rhythm"
          subtitle="This page is a temporary harness to validate spacing, padding, and density across key UI surfaces."
          primaryHref="/dossiers"
          secondaryHref="/evidence"
          primaryLabel="Browse dossiers"
          secondaryLabel="Browse evidence"
          eyebrow="Clarum demo"
        />
      </section>

      <section>
        <SectionHeader title="Cards in a grid" subtitle="Representative card spacing." />
        <div className="card-grid">
          {demoDossiers.map((item) => (
            <DossierCard key={item.id} dossier={item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Evidence list" subtitle="Card grid with metadata and tags." />
        <div className="card-grid">
          {demoEvidence.map((item) => (
            <EvidenceCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Indicator table" subtitle="Table container and row spacing." />
        <IndicatorTable indicators={demoIndicators} />
      </section>

      <section>
        <SectionHeader title="Panels" subtitle="Info panels with consistent padding." />
        <div className="grid gap-4 md:grid-cols-3">
          <InfoPanel title="Coverage" body="3 regions · 8 domains" />
          <InfoPanel title="Method" body="Deterministic scoring with evidence gating." />
          <InfoPanel title="Output" body="Auditable dossiers with source links." />
        </div>
      </section>
    </div>
  );
}
