import Link from "next/link";
import { AnimatedProgress } from "@/components/AnimatedProgress";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DomainNav } from "@/components/DomainNav";
import { EmptyState } from "@/components/EmptyState";
import { IndicatorTable } from "@/components/IndicatorTable";
import { MemoArticle } from "@/components/MemoArticle";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { ViewToggle } from "@/components/ViewToggle";
import { Badge } from "@/components/ui/Badge";
import { getAllDossiers, getAllEvidenceList, getDossier, getDossierMemo } from "@/data/loaders";
import { formatDate, formatPercent } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const dossiers = await getAllDossiers();
  return dossiers.map((dossier) => ({ slug: dossier.slug }));
}

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const dossier = await getDossier(resolvedParams.slug);

  if (!dossier) {
    return (
      <div className="page-shell section-y">
        <EmptyState
          title="Dossier not found"
          message="Check the dossier list for available entries."
          action={
            <Link className="text-accent hover:underline" href="/dossiers">
              Back to dossiers
            </Link>
          }
        />
      </div>
    );
  }

  const evidenceIndex = await getAllEvidenceList();
  const evidenceById = new Map(evidenceIndex.map((item) => [item.id, item]));
  const evidence = dossier.evidenceRefs
    .map((id) => evidenceById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const confidencePct = Math.round(dossier.confidenceScore * 100);
  const completenessPct = Math.round(dossier.completenessScore * 100);
  const profileWeightedScore =
    dossier.profileWeightedCompletenessPct !== undefined
      ? dossier.profileWeightedCompletenessPct / 100
      : null;
  const profileWeightedPct =
    profileWeightedScore === null ? null : Math.round(profileWeightedScore * 100);
  const tierA = dossier.tierSummary.A ?? 0;
  const tierB = dossier.tierSummary.B ?? 0;
  const topSummary =
    dossier.flags[0]?.summary ??
    "Structured dossier with scored confidence, completeness, and source-linked evidence.";

  const quickFacts = [
    { label: "Country", value: dossier.country },
    { label: "Track", value: dossier.trackLabel },
    { label: "Profile", value: dossier.profileId },
    { label: "Confidence cap", value: dossier.confidenceCap },
  ];

  const notePanels = [
    {
      title: "Flag summary",
      items: dossier.flags.map((flag) => flag.summary),
      empty: "No flags triggered.",
    },
    {
      title: "Confidence reasons",
      items: dossier.confidenceReasons,
      empty: "No confidence cap reasons listed.",
    },
    {
      title: "Warnings",
      items: dossier.warnings,
      empty: "No warnings listed.",
    },
    {
      title: "Next actions",
      items: dossier.nextActions,
      empty: "No next actions listed.",
    },
  ];

  const memoAvailable = Boolean(dossier.memoMdPath || dossier.memoJsonPath);
  const memoData = await getDossierMemo(dossier.memoMdPath, dossier.memoJsonPath);
  const memoBlocks = memoData.markdown ? renderMarkdown(memoData.markdown) : [];
  const memoJson = memoData.json;
  const memoCompletenessPct =
    typeof memoJson?.completeness_pct === "number" ? memoJson.completeness_pct : null;
  const memoTierBPresent =
    typeof memoJson?.tier_b_present === "boolean" ? memoJson.tier_b_present : null;
  const memoConfidenceCap =
    typeof memoJson?.confidence_cap === "string" ? memoJson.confidence_cap : null;
  const memoConfidenceCapsRaw = memoJson?.confidence_caps;
  const memoConfidenceCaps = Array.isArray(memoConfidenceCapsRaw)
    ? memoConfidenceCapsRaw.filter((entry): entry is string => typeof entry === "string")
    : [];
  const memoConfidenceLabel =
    memoConfidenceCap ?? (memoConfidenceCaps.length > 0 ? memoConfidenceCaps.join(", ") : null);
  const memoGeneratedAt = typeof memoJson?.generated_at === "string" ? memoJson.generated_at : null;

  const reportContent = (
    <div className="section-y">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="surface-raised card-pad rounded-xl border border-border">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Score profile</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card-pad-tight rounded-lg border border-border/75 bg-bg/60">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">Confidence</div>
                <div className="mt-1 font-display text-lg text-fg">
                  {formatPercent(dossier.confidenceScore)}
                </div>
                <div className="mt-2">
                  <AnimatedProgress value={confidencePct} color="bg-good/80" delay={0.1} label={`Confidence ${confidencePct}%`} />
                </div>
              </div>
              <div className="card-pad-tight rounded-lg border border-border/75 bg-bg/60">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">Completeness</div>
                <div className="mt-1 font-display text-lg text-fg">
                  {formatPercent(dossier.completenessScore)}
                </div>
                <div className="mt-2">
                  <AnimatedProgress value={completenessPct} color="bg-accent3/80" delay={0.2} label={`Completeness ${completenessPct}%`} />
                </div>
              </div>
              <div className="card-pad-tight rounded-lg border border-border/75 bg-bg/60">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">
                  Profile-weighted
                </div>
                <div className="mt-1 font-display text-lg text-fg">
                  {profileWeightedScore === null ? "—" : formatPercent(profileWeightedScore)}
                </div>
                <div className="mt-2">
                  <AnimatedProgress
                    value={profileWeightedPct ?? 0}
                    color="bg-accent3/70"
                    delay={0.3}
                    label={`Profile-weighted completeness ${profileWeightedPct ?? 0}%`}
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Profile-weighted completeness reflects only the domains in scope for the selected
              profile.
            </p>
          </div>

          <div className="surface-raised card-pad rounded-xl border border-border">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Evidence posture</div>
            <div className="mt-4 stack-sm">
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-bg/60 px-3 py-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  Tier A refs
                </span>
                <span className="text-sm font-semibold text-fg">{tierA}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-bg/60 px-3 py-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  Tier B refs
                </span>
                <span className="text-sm font-semibold text-fg">{tierB}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-bg/60 px-3 py-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  Evidence cited
                </span>
                <span className="text-sm font-semibold text-fg">{evidence.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-bg/60 px-3 py-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  Flags raised
                </span>
                <span className="text-sm font-semibold text-fg">{dossier.flags.length}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Analyst notes"
            subtitle="Structured notes for decision reviews and follow-up."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {notePanels.map((panel) => (
              <div
                key={panel.title}
                className="surface-flush card-pad rounded-xl border border-border"
              >
                <h3 className="font-display text-base text-fg">{panel.title}</h3>
                {panel.items.length === 0 ? (
                  <p className="mt-3 text-sm text-fg/75">{panel.empty}</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-fg/80">
                    {panel.items.map((item) => (
                      <li
                        key={`${panel.title}-${item}`}
                        className="rounded-md border border-border/70 bg-bg/50 px-3 py-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Domain breakdown"
            subtitle="A1-A8 domain view with indicator tables."
          />
          <div className="card-pad-tight mb-5 rounded-xl border border-border bg-card shadow-raised">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Jump to domain</div>
            <DomainNav domains={dossier.domains} className="mt-3" />
          </div>
          <div className="stack-lg">
            {dossier.domains.map((domain) => (
                <article
                  key={domain.id}
                  id={domain.id}
                  className="surface-raised card-pad scroll-mt-24 rounded-xl border border-border"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted">
                        {domain.id}
                      </div>
                      <h3 className="font-display text-lg text-fg">{domain.name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {domain.summary || "No domain summary provided."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {domain.completenessPct !== undefined && (
                        <Badge variant="neutral">
                          {domain.complete !== undefined && domain.inScope !== undefined
                            ? `${domain.complete}/${domain.inScope} complete · ${Math.round(
                                domain.completenessPct
                              )}%`
                            : `${Math.round(domain.completenessPct)}% in-scope`}
                        </Badge>
                      )}
                      <Badge variant="neutral">{domain.indicators.length} indicators</Badge>
                    </div>
                  </div>
                  <IndicatorTable indicators={domain.indicators} />
                </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Evidence cited"
            subtitle="Evidence items referenced in this dossier."
          />
          {evidence.length === 0 ? (
            <EmptyState message="No evidence is linked yet." />
          ) : (
            <div className="grid gap-3">
              {evidence.map((item) => (
                <Link
                  key={item.id}
                  href={`/evidence/${item.id}`}
                  prefetch={false}
                  className="surface-flush card-pad-tight rounded-xl border border-border text-sm text-fg transition-all duration-200 hover:shadow-raised hover:border-accent hover:-translate-y-0.5"
                >
                  <div className="font-medium leading-snug">{item.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                    {item.sourceType} - {formatDate(item.publicationDate)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
    </div>
  );

  const memoContent = (
    <div className="section-y">
        <section className="section-y">
          <SectionHeader
            title="Memo"
            subtitle="Read-only memo notes attached to this dossier export."
          />
          {!memoAvailable && (
            <EmptyState message="Memo not available for this dossier export." />
          )}

          {memoAvailable && (
            <div className="card-pad rounded-xl border border-border bg-card shadow-soft">
              <div className="text-xs uppercase tracking-[0.2em] text-muted">Memo metadata</div>
              <div className="mt-3 grid gap-2 text-sm text-fg/80">
                <div>
                  Data quality:{" "}
                  {memoCompletenessPct === null ? "—" : `${Math.round(memoCompletenessPct)}%`}{" "}
                  completeness
                  {memoTierBPresent === null
                    ? " · Tier B: —"
                    : ` · Tier B: ${memoTierBPresent ? "present" : "not present"}`}
                  {memoConfidenceLabel
                    ? ` · Confidence cap: ${memoConfidenceLabel}`
                    : " · Confidence cap: —"}
                </div>
                {memoGeneratedAt && (
                  <div className="text-xs text-muted">
                    Generated {formatDate(memoGeneratedAt)}
                  </div>
                )}
              </div>
            </div>
          )}

          {memoAvailable && memoData.markdownError && !memoData.markdown && (
            <p className="card-pad-tight rounded-lg border border-border bg-card text-sm text-warn shadow-flush">
              {memoData.markdownError}
            </p>
          )}

          {memoData.markdown && (
            <MemoArticle blocks={memoBlocks} />
          )}

          {!memoData.markdown && memoData.json && (
            <pre className="card-pad-tight whitespace-pre-wrap rounded-xl border border-border bg-bg/60 text-xs text-fg/80 shadow-flush">
              {JSON.stringify(memoData.json, null, 2)}
            </pre>
          )}
        </section>
    </div>
  );

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb segments={[{ label: "Dossiers", href: "/dossiers" }, { label: dossier.title }]} />

      <ScrollReveal>
        <section className="surface-floating card-pad rounded-2xl border border-border lg:p-6">
          <div className="section-label">01 Dossier brief</div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-2xl font-normal text-fg md:text-3xl">
                {dossier.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-fg/80">{topSummary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="good" className="px-3 py-1 text-sm md:text-base">
                Confidence {formatPercent(dossier.confidenceScore)}
              </Badge>
              <Badge variant="warn" className="px-3 py-1 text-sm md:text-base">
                Completeness {formatPercent(dossier.completenessScore)}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="card-pad-tight rounded-lg border border-border/75 bg-bg/60"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-muted">{fact.label}</div>
                <div className="mt-1 text-sm font-semibold text-fg">{fact.value}</div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ViewToggle
        reportContent={reportContent}
        memoContent={memoContent}
      />
    </div>
  );
}
