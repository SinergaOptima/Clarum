import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";

const howItWorks = [
  "Define the case: country, sector, role, and market mode (export/domestic).",
  "Select a weight profile and overlay that reflect the case priorities.",
  "Score indicators with rubric anchors and normalized comparators.",
  "Enforce evidence tier gates and calculate completeness.",
  "Apply confidence caps based on missingness and evidence thresholds.",
  "Generate the dossier artifact with audit fields and sources.",
  "Publish the versioned bundle through site_export for the site to read.",
];

const definitions: { term: string; desc: string }[] = [
  {
    term: "LRF-1",
    desc: "Clarum's internal rubric for market-entry risk across eight domains (A1-A8).",
  },
  { term: "Indicator", desc: "A measurable proxy mapped to the LRF-1 risk ontology." },
  {
    term: "Domain",
    desc: "One of A1-A8 risk groupings (regulatory, geopolitical, policy, infrastructure, supply, labor, capital, ESG).",
  },
  {
    term: "Evidence record",
    desc: "A cited source entry with URL, date, and notes used to justify indicators.",
  },
  {
    term: "Tier A/B",
    desc: "Tier A is authoritative; Tier B is a proxy or survey. Tier B is allowed but flagged.",
  },
  { term: "Completeness", desc: "Coverage of required indicators." },
  { term: "Confidence", desc: "Evidence-backed reliability after gating and penalties." },
  { term: "Profile/Overlay", desc: "Weighting rules and adjustments for the case context." },
];

export default function AboutPage() {
  return (
    <div className="page-shell section-y">
      <Breadcrumb segments={[{ label: "About" }]} />

      <ScrollReveal>
        <section>
          <div className="section-label">01 About</div>
          <h1 className="mt-4 font-display text-3xl font-normal text-fg md:text-4xl lg:text-5xl">
            Clarum
          </h1>
          <p className="mt-3 section-preface">
            Clarum is a market-entry risk engine that turns authoritative data into structured
            dossiers, linking every claim back to a source and a clear scoring rubric.
          </p>
          <p className="free-note mt-3 text-xs">
            Featured dossiers and public evidence are free to browse. Tailored analytics
            are offered via paid plans.
          </p>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">02 What Clarum is and isn&apos;t</div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">What it is</h2>
              <p className="mt-2 text-sm text-fg/80">
                A structured risk intelligence system that applies a deterministic rubric across eight
                risk domains. It outputs dossiers with domain scores, indicator tables, and a
                traceable evidence ledger — auditable and reproducible.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">What it is not</h2>
              <p className="mt-2 text-sm text-fg/80">
                Not a black-box score, not a forecasting oracle, and not a substitute for legal or
                regulatory counsel. Clarum models structural exposure, not event prediction.
                Coverage can be incomplete — gaps are visible and reduce confidence.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">03 How it works</div>
          <blockquote className="my-6 border-l-2 border-accent3/40 pl-6 font-display text-xl italic text-fg/70 lg:text-2xl">
            The same inputs always yield the same outputs.
          </blockquote>
          <div className="mt-4 grid gap-4">
            {howItWorks.map((step, i) => (
              <div key={step} className="flex items-start gap-4">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm ${i % 2 === 0 ? "bg-accent/12 text-accent" : "bg-accent3/12 text-accent3"}`}>
                  {i + 1}
                </span>
                <p className="pt-1 text-sm text-fg/80">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">04 What you can do here</div>
          <p className="section-preface">
            Browse dossiers, inspect the evidence library, and use the command palette
            (<kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[0.65rem] text-muted">Ctrl K</kbd>)
            for fast navigation.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Dossiers</h2>
              <p className="mt-2 text-sm text-fg/80">
                Each dossier covers A1-A8 domains with indicator tables, evidence citations, and
                confidence/completeness signals.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Evidence library</h2>
              <p className="mt-2 text-sm text-fg/80">
                Every indicator and claim ties back to a source with date, URL, and notes.
                Tier A sources are authoritative; Tier B are flagged proxies that can cap confidence.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">05 Definitions</div>
          <dl className="grid gap-4 lg:grid-cols-2">
            {definitions.map((def) => (
              <div
                key={def.term}
                className="surface-flush card-pad rounded-xl border border-border"
              >
                <dt className="font-display text-base text-fg">{def.term}</dt>
                <dd className="mt-1 text-sm text-fg/80">{def.desc}</dd>
              </div>
            ))}
          </dl>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section>
          <div className="section-label">06 Limitations</div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">Coverage is explicit</h2>
              <p className="mt-2 text-sm text-fg/80">
                Completeness can be low in early coverage. Gaps are visible and reduce confidence.
                Decisions still require local diligence and regulatory review.
              </p>
            </div>
            <div className="surface-raised card-pad rounded-xl border border-border">
              <h2 className="font-display text-lg text-fg">For strategy and entry teams</h2>
              <p className="mt-2 text-sm text-fg/80">
                Use dossiers to compare locations, document risk trade-offs, and align leadership on
                mitigation priorities with a consistent rubric.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
