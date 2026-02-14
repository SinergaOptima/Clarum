import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import type { EvidenceListItem } from "@/data/types";
import { formatDate } from "@/lib/format";

export function EvidenceCard({ item }: { item: EvidenceListItem }) {
  return (
    <article className="group/ev relative block h-full overflow-hidden rounded-xl border border-border bg-card shadow-raised transition-all duration-300 hover:shadow-floating hover:border-accent/25">
      <Link
        href={`/evidence/${item.id}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-inset"
        aria-label={`Read evidence: ${item.title} - ${item.sourceType}, published ${formatDate(item.publicationDate)}`}
        tabIndex={0}
      >
        <span className="sr-only">Read evidence</span>
      </Link>
      <CardHeader className="card-pad mb-0 border-b border-border/70 bg-gradient-to-br from-accent2/10 to-transparent relative z-20">
        <div>
          <CardTitle className="transition-colors duration-300 group-hover/ev:text-accent">
            {item.title}
          </CardTitle>
          <div className="relative mt-1 inline-block text-xs text-muted uppercase tracking-[0.18em]">
            {item.sourceType}
            <span className="absolute -bottom-0.5 left-1/2 h-px w-full -translate-x-1/2 scale-x-0 bg-accent/40 transition-transform duration-300 origin-center group-hover/ev:scale-x-100" />
          </div>
        </div>
        <Badge variant="neutral">{formatDate(item.publicationDate)}</Badge>
      </CardHeader>
      <div className="stack-md card-pad text-sm text-fg/80 relative z-20">
        <p>{item.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {item.tags.map((tag) => (
            <Badge key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
        <span className="link-underline link-accent inline-flex items-center gap-1.5 text-sm font-medium">
          Read evidence
          <span
            className="inline-block transition-transform duration-200 group-hover/ev:translate-x-1"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </span>
      </div>
    </article>
  );
}
