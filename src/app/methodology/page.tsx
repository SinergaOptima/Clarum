import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getAllDossiers, getAllEvidenceList, isExportBundleAvailable } from "@/data/loaders";

const domains = [
  {
    id: "A1",
    name: "Regulatory stability",
    desc: "Predictability of rules, permitting timelines, and enforcement consistency for long-term operations.",
  },
  {
    id: "A2",
    name: "Geopolitics and trade",
    desc: "Exposure to sanctions, export controls, alliance alignment, and cross-border policy conflict.",
  },
  {
    id: "A3",
    name: "Industrial policy",
    desc: "State support, market access, localization requirements, and sector prioritization.",
  },
  {
    id: "A4",
    name: "Infrastructure",
    desc: "Power quality, logistics throughput, industrial land access, and operational bottlenecks.",
  },
  {
    id: "A5",
    name: "Supply chain",
    desc: "Depth and resilience of suppliers, critical materials, and export concentration risk.",
  },
  {
    id: "A6",
    name: "Labor and talent",
    desc: "Workforce capability, STEM pipeline, labor flexibility, and operational capacity.",
  },
  {
    id: "A7",
    name: "Capital and FX",
    desc: "Currency volatility, capital controls, inflation risk, and repatriation friction.",
  },
  {
    id: "A8",
    name: "Integrity and ESG",
    desc: "Governance exposure, compliance constraints, corruption risk, and social license.",
  },
];

const pipelineSteps = [
  "Case definition (country, sector, role, mode).",
  "Profile and overlay selection.",
  "Indicator normalization to 1-5 scores.",
  "Evidence gating and confidence assignment.",
  "Missingness penalty (confidence cap).",
  "Domain aggregation and composite score.",
];

export default async function MethodologyPage() {
  const [dossiers, evidence, exportAvailable] = await Promise.all([
    getAllDossiers(),
    getAllEvidenceList(),
    isExportBundleAvailable(),
  ]);
  const dossierCount = dossiers.length;
  const evidenceCount = evidence.length;

  return (
    <div className="page-shell section-y">
      <Breadcrumb segments={[{ label: "Methodology" }]} />
      <ScrollReveal>
        <section>
          <div className="section-label">01 Methodology</div>
          <h1 className="mt-4 font-display text-2xl font-normal text-fg md:text-3xl">
            Scoring and evidence gates
          </h1>
          <p className="mt-3 section-preface">
            Clarum uses LRF-1, a deterministic risk framework built on an indicator library (A1-A8),
            rubric anchors, and evidence gating. The goal is auditability and decision support, not
            prediction.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">02 Coverage snapshot</div>
          <div className="mt-4 surface-raised card-pad rounded-xl border border-border">
            <p className="text-sm text-fg/80">
              Current bundle includes {dossierCount} dossiers and {evidenceCount} evidence records.
            </p>
            <p className="mt-2 text-xs text-muted">
              {exportAvailable
                ? "Live site_export bundle detected."
                : "Using demo fallback while site_export is unavailable."}
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">03 LRF-1 in a sentence</div>
          <p className="section-preface">
            LRF-1 is a market-entry risk ontology and indicator library that scores constraints
            across A1-A8 domains to surface operational friction and viability threats.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">04 Domains A1-A8</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {domains.map((domain, i) => (
              <ScrollReveal key={domain.id} delay={i * 0.04}>
                <div className="flex items-start gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-sm shadow-flush ${i < 4 ? "bg-accent/10 text-accent" : "bg-accent3/10 text-accent3"}`}>
                    {domain.id}
                  </span>
                  <div>
                    <h2 className="font-display text-base text-fg">{domain.name}</h2>
                    <p className="mt-1 text-sm text-fg/80">{domain.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">05 Deterministic scoring pipeline</div>
          <p className="text-sm text-fg/80">
            The scoring pipeline moves from case definition to normalized indicator scores, evidence
            gating, missingness penalties, and weighted aggregation. Scores are outputs, not analyst
            inputs.
          </p>
          <div className="mt-6 grid gap-3">
            {pipelineSteps.map((step, i) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 font-display text-xs font-medium text-accent">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm text-fg/80">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 surface-raised card-pad rounded-xl border border-border">
            <div className="text-xs uppercase tracking-[0.16em] text-muted">Pipeline flow</div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
              {[
                "Case definition",
                "Profile selection",
                "Indicator normalization",
                "Evidence gating",
                "Confidence cap",
                "Domain aggregation",
              ].map((label, i, arr) => (
                <span key={label} className="contents">
                  <span className={`rounded-md border px-2.5 py-1.5 ${i % 2 === 0 ? "border-accent/20 bg-accent/8 text-accent" : "border-accent3/20 bg-accent3/8 text-accent3"}`}>
                    {label}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-muted" aria-hidden="true">
                      &rarr;
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">06 Rubric anchors and thresholds</div>
          <p className="section-preface">
            LRF-1 uses a 1.0-5.0 scale with defined bands: Low (1.0-1.9), Moderate (2.0-2.9), High
            (3.0-3.9), Extreme (4.0-5.0). Indicators are normalized using percentile mapping against
            comparator sets (0-100 percentile bands map to the 1-5 scale), then aggregated by
            domain.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">07 Evidence gates and tier policy</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Tier A vs Tier B</h2>
              <p className="mt-2 text-sm text-fg/80">
                Tier A sources are authoritative and primary (World Bank, IMF, OECD). Tier B sources
                are credible proxies or surveys. Tier B is allowed but explicitly flagged and never
                promoted to Tier A in confidence checks.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Evidence requirements</h2>
              <p className="mt-2 text-sm text-fg/80">
                Domains must meet minimum evidence counts and Tier A/B ratios to reach Medium or
                High confidence. Contradictions cap confidence and raise flags.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">08 Missingness, completeness, confidence</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Completeness</h2>
              <p className="mt-2 text-sm text-fg/80">
                Completeness is the share of required indicators filled. Per-domain completeness is
                visible, and low completeness triggers conservative confidence caps.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Confidence</h2>
              <p className="mt-2 text-sm text-fg/80">
                Confidence reflects evidence quality and missingness penalties. If critical
                indicators are missing, confidence is capped at Low even when scores are computed.
              </p>
              <p className="mt-2 text-sm text-fg/80">
                Fatal-missingness is treated as a guardrail: if required indicators in a critical
                domain are absent, the dossier is flagged for review and cannot claim Medium or High
                confidence.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">09 Profiles and overlays</div>
          <p className="section-preface">
            Weight profiles define how domains are prioritized based on sector, role, and mode
            (e.g., EV OEM Export vs Battery Cell Greenfield). Profiles are versioned and immutable
            so dossiers remain reproducible. Overlays (e.g., Balanced vs Conservative) apply
            explicit adjustments to thresholds or weights and remain auditable.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">10 Reproducibility and audit trail</div>
          <p className="section-preface">
            Reports are generated as deterministic JSON artifacts with audit fields. The website
            reads from a versioned site_export.v1 bundle, preserving lineage for every dossier.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">11 Limitations</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Coverage is explicit</h2>
              <p className="mt-2 text-sm text-fg/80">
                Completeness can be low in early coverage. Gaps are visible and must be treated as
                constraints, not ignored.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Not a prediction system</h2>
              <p className="mt-2 text-sm text-fg/80">
                Clarum does not forecast outcomes. It documents constraints, evidence, and
                trade-offs to inform decisions.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Tier B is flagged</h2>
              <p className="mt-2 text-sm text-fg/80">
                Proxy evidence is disclosed and can cap confidence. Reviewers should validate
                critical claims with Tier A where possible.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Evidence staleness</h2>
              <p className="mt-2 text-sm text-fg/80">
                Data can go stale. Refresh cadence matters, and stale flags are surfaced in the
                audit trail.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
