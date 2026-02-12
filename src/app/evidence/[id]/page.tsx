import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EmptyState } from "@/components/EmptyState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { getAllEvidenceList, getEvidence, getEvidenceBacklinks } from "@/data/loaders";
import { formatDate } from "@/lib/format";
import { type MarkdownBlock, renderMarkdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const items = await getAllEvidenceList();
  return items.map((item) => ({ id: item.id }));
}

export default async function EvidenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const detail = await getEvidence(resolvedParams.id);

  if (!detail) {
    return (
      <div className="page-shell section-y">
        <Breadcrumb segments={[{ label: "Evidence", href: "/evidence" }, { label: "Not found" }]} />
        <EmptyState
          title="Evidence not found"
          message="This evidence record doesn't exist or may have been removed."
          action={
            <Link className="link-accent text-sm font-medium hover:underline" href="/evidence">
              Back to evidence library
            </Link>
          }
        />
      </div>
    );
  }

  const blocks = renderMarkdown(detail.markdown);
  const related = await getEvidenceBacklinks(resolvedParams.id);

  function renderBlock(block: MarkdownBlock, index: number) {
    if (block.type === "heading") {
      const headingClass =
        block.level === 1
          ? "font-display text-2xl text-fg"
          : block.level === 2
            ? "font-display text-xl text-fg"
            : "font-display text-lg text-fg";
      return (
        <h2 key={`${block.type}-${index}`} className={headingClass}>
          {block.text}
        </h2>
      );
    }

    if (block.type === "list") {
      return (
        <ul key={`${block.type}-${index}`} className="list-disc space-y-1 pl-5">
          {block.items.map((entry) => (
            <li key={`${block.type}-${entry}`}>{entry}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`${block.type}-${index}`} className="text-fg/80">
        {block.text}
      </p>
    );
  }

  return (
    <div className="page-shell section-y">
      <Breadcrumb
        segments={[{ label: "Evidence", href: "/evidence" }, { label: detail.item.title }]}
      />

      <ScrollReveal>
        <section>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Evidence</div>
          <h1 className="font-display text-2xl font-normal text-fg md:text-3xl">
            {detail.item.title}
          </h1>
          <div className="mt-2 text-sm text-muted">
            {detail.item.sourceType} · {formatDate(detail.item.publicationDate)}
          </div>
        </section>
      </ScrollReveal>

      {detail.item.tags.length > 0 && (
        <section>
          <div className="flex flex-wrap gap-2">
            {detail.item.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </section>
      )}

      <ScrollReveal delay={0.1}>
        <section>
          <article className="markdown prose-pad grid gap-4 max-w-none rounded-xl border border-border bg-card text-sm text-fg/80 shadow-raised">
            {blocks.map((block, index) => renderBlock(block, index))}
          </article>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section>
          <SectionHeader title="Backlinked dossiers" subtitle="Dossiers citing this evidence." />
          <div className="grid gap-3">
            {related.map((dossier) => (
              <Link
                key={dossier.slug}
                href={`/dossiers/${dossier.slug}`}
                prefetch={false}
                className="surface-flush card-pad-tight rounded-xl border border-border text-sm text-fg transition-all duration-200 hover:shadow-raised hover:border-accent hover:-translate-y-0.5"
              >
                <div className="font-medium">{dossier.title}</div>
                <div className="text-xs text-muted">{dossier.country}</div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
