import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import type { EvidenceListItem } from "@/data/types";
import { formatDate } from "@/lib/format";

export function EvidenceCard({ item }: { item: EvidenceListItem }) {
  return (
    <Link
      href={`/evidence/${item.id}`}
      className="group/ev block h-full overflow-hidden rounded-xl border border-border bg-card shadow-raised transition-all duration-300 hover:shadow-floating hover:border-accent/25 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <CardHeader className="card-pad mb-0 border-b border-border/70 bg-gradient-to-br from-accent2/10 to-transparent">
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
      <div className="stack-md card-pad text-sm text-fg/80">
        <p>{item.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {item.tags.map((tag) => (
            <Badge
              key={tag}
              className="transition-all duration-200 group-hover/ev:scale-[1.03] group-hover/ev:shadow-sm"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <span className="link-underline inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Read evidence
          <span
            className="inline-block transition-transform duration-200 group-hover/ev:translate-x-1"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}
