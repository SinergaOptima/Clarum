import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { EvidenceListItem } from "@/data/types";
import { formatDate } from "@/lib/format";

export function EvidenceRow({ item }: { item: EvidenceListItem }) {
  return (
    <div className="card-surface card-pad rounded-lg border border-border bg-card shadow-soft">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr] md:items-center">
        <div>
          <Link
            className="text-base font-semibold text-fg hover:underline"
            href={`/evidence/${item.id}`}
          >
            {item.title}
          </Link>
          <div className="mt-1 text-xs text-muted">
            {item.sourceType} · {formatDate(item.publicationDate)}
          </div>
          <p className="mt-2 text-sm text-fg/80">{item.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {item.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <div className="text-xs text-muted">Tier: {item.tier}</div>
      </div>
    </div>
  );
}
