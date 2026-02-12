import Link from "next/link";
import { AnimatedProgress } from "@/components/AnimatedProgress";
import { Badge } from "@/components/ui/Badge";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import type { DossierListItem } from "@/data/types";
import { formatPercent } from "@/lib/format";

export function DossierCard({ dossier }: { dossier: DossierListItem }) {
  const confidencePct = Math.round(dossier.confidenceScore * 100);
  const completenessPct = Math.round(dossier.completenessScore * 100);
  const tierA = dossier.tierSummary.A ?? 0;
  const tierB = dossier.tierSummary.B ?? 0;

  return (
    <Link
      href={`/dossiers/${dossier.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/90 bg-card/95 shadow-raised transition-all duration-300 hover:shadow-floating hover:border-accent/25 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <CardHeader className="relative card-pad mb-0 border-b border-border/70 bg-gradient-to-br from-accent/10 to-transparent">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.06] to-accent/[0.02] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative stack-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral" className="tracking-[0.16em] uppercase">
              {dossier.trackLabel}
            </Badge>
            <Badge variant="neutral">{dossier.country}</Badge>
          </div>
          <div>
            <CardTitle className="text-xl leading-tight">{dossier.title}</CardTitle>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
              Profile {dossier.profileId}
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="stack-md card-pad flex-1 text-sm text-fg/80">
        <p className="leading-relaxed">{dossier.summary}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card-pad-tight rounded-lg border border-border/80 bg-bg/60">
            <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">Confidence</div>
            <div className="mt-1 font-display text-lg text-fg">
              {formatPercent(dossier.confidenceScore)}
            </div>
            <div className="mt-2">
              <AnimatedProgress value={confidencePct} color="bg-good/80" dotColor="rgb(var(--good))" delay={0.1} showDot label={`Confidence ${confidencePct}%`} />
            </div>
          </div>
          <div className="card-pad-tight rounded-lg border border-border/80 bg-bg/60">
            <div className="text-[0.68rem] uppercase tracking-[0.16em] text-muted">
              Completeness
            </div>
            <div className="mt-1 font-display text-lg text-fg">
              {formatPercent(dossier.completenessScore)}
            </div>
            <div className="mt-2">
              <AnimatedProgress value={completenessPct} color="bg-accent3/80" dotColor="rgb(var(--accent-3))" delay={0.2} showDot label={`Completeness ${completenessPct}%`} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="neutral">Tier A {tierA}</Badge>
          <Badge variant="neutral">Tier B {tierB}</Badge>
          {dossier.flags.length > 0 ? (
            <Badge variant="warn">Flags {dossier.flags.length}</Badge>
          ) : (
            <Badge variant="good">No flags</Badge>
          )}
        </div>

        <span className="link-underline link-accent mt-auto inline-flex items-center gap-1.5 text-sm font-medium">
          Open dossier
          <span
            className="inline-block transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}
