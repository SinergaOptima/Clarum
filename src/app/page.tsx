import Link from "next/link";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { DossierCard } from "@/components/DossierCard";
import { EvidenceCard } from "@/components/EvidenceCard";
import { Hero } from "@/components/Hero";
import { InfoPanel } from "@/components/InfoPanel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/ui/Button";
import { getAllDossiers, getAllEvidenceList } from "@/data/loaders";

export default async function HomePage() {
  const dossiers = await getAllDossiers();
  const evidence = await getAllEvidenceList();
  const featured = dossiers.slice(0, 3);

  const stats = [
    { label: "Dossiers", value: dossiers.length },
    { label: "Evidence notes", value: evidence.length },
    { label: "Countries", value: new Set(dossiers.map((item) => item.country)).size },
  ];

  return (
    <div className="page-shell section-y text-sm">
      <ScrollReveal>
        <section>
          <div className="section-label">01 Overview</div>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Hero
              title="Evidence-linked market-entry risk analytics."
              subtitle="Clarum turns fragmented research into structured, cited risk dossiers for corporations entering new markets, especially in tech-driven industries."
              primaryHref="/dossiers"
              secondaryHref="/methodology"
              primaryLabel="Browse dossiers"
              secondaryLabel="How it works"
              eyebrow="Clarum, by Lattice Labs"
            />
            <div className="card-pad rounded-xl border border-border bg-card shadow-raised transition-all duration-200 hover:shadow-floating hover:border-accent/20 lg:p-6">
              <div className="text-xs tracking-[0.2em] text-muted uppercase">At a glance</div>
              <div className="mt-4 grid gap-3">
                <InfoPanel title="Coverage" body="3 regions · 8 domains" />
                <InfoPanel title="Method" body="LRF-1 scoring with traceable evidence." />
                <InfoPanel
                  title="Purpose"
                  body="Evidence-backed risk clarity for entry decisions."
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section>
          <div className="section-label">02 Signal summary</div>
          <p className="section-preface">
            A snapshot of current coverage across the dossier set.
          </p>
          <div className="stat-strip mt-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex-1 px-4 py-4 text-center sm:px-6 sm:py-5">
                <AnimatedCounter
                  value={stat.value}
                  delay={i * 0.15}
                  className="font-display text-2xl text-fg sm:text-3xl"
                />
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15} blur>
        <section>
          <div className="section-label">03 Built for tech-forward teams</div>
          <p className="section-preface">
            Analytics for corporations navigating complex supply chains.
          </p>
          {(() => {
            const industries = [
              "EV & Battery",
              "Semiconductors",
              "Industrial Tech",
              "Energy & Infrastructure",
              "Logistics",
              "Corporate Strategy",
              "VC & PE Diligence",
            ];
            return (
              <div className="trust-strip" aria-label={`Industries served: ${industries.join(", ")}`}>
                <div className="trust-strip-track">
                  {industries.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                  {industries.map((item) => (
                    <span key={`dup-${item}`} aria-hidden="true">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
          <div className="manifesto-strip">
            <span>Auditable</span>
            <span>Evidence-linked</span>
            <span>Reproducible</span>
          </div>
        </section>
      </ScrollReveal>

      <section>
        <ScrollReveal>
          <SectionHeader
            title="Featured dossiers"
            subtitle="Start with these high-priority topics."
          />
          <p className="section-preface">
            Public dossiers and evidence are free to browse. Tailored analytics require a paid plan.
          </p>
        </ScrollReveal>
        <div className="card-grid mt-4">
          {featured.map((item, i) => (
            <ScrollReveal key={item.slug} delay={i * 0.1}>
              <DossierCard dossier={item} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section>
        <ScrollReveal>
          <SectionHeader
            title="Recent evidence"
            subtitle="Latest evidence notes linked back to dossiers."
          />
          <p className="section-preface">
            Evidence records stay traceable by source, date, and domain context.
          </p>
        </ScrollReveal>
        <div className="card-grid mt-4 grid-cols-1 md:grid-cols-2">
          {evidence.slice(0, 3).map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.1}>
              <EvidenceCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <ScrollReveal blur>
        <section>
          <div className="section-label">06 Tailored analytics</div>
          <div className="cta-band surface-floating">
            <div>
              <h3>Request tailored market-entry analytics</h3>
              <p>
                Commission a private dossier with LRF-1 scoring, evidence traceability, and
                executive-ready outputs tuned to your sector and supply chain position.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/costs">View plans</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/methodology">View methodology</Link>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
