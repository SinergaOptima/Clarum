import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { DossierListItem } from "@/data/types";
import { formatPercent } from "@/lib/format";

export function DossierRow({ dossier }: { dossier: DossierListItem }) {
  return (
    <div className="card-surface card-pad rounded-lg border border-border bg-card shadow-soft">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr] md:items-center">
        <div>
          <Link
            className="text-base font-semibold text-fg hover:underline"
            href={`/dossiers/${dossier.slug}`}
          >
            {dossier.title}
          </Link>
          <div className="mt-1 text-xs text-muted">
            {dossier.country} · {dossier.trackLabel} · {dossier.profileId}
          </div>
          <p className="mt-2 text-sm text-fg/80">{dossier.summary}</p>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <Badge variant="good">Confidence {formatPercent(dossier.confidenceScore)}</Badge>
          <Badge variant="warn">Completeness {formatPercent(dossier.completenessScore)}</Badge>
        </div>
        <div className="text-xs text-muted">Track: {dossier.trackLabel}</div>
      </div>
    </div>
  );
}
