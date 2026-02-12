import type { MarkdownBlock } from "@/lib/markdown";

/**
 * Renders memo markdown blocks with context-aware formatting.
 * Detects sections (Risk Register, Citations, Data Quality, Key Findings)
 * and applies structured rendering for each.
 */
export function MemoArticle({ blocks }: { blocks: MarkdownBlock[] }) {
  let currentSection = "";

  return (
    <article className="markdown prose-pad grid gap-5 max-w-none rounded-xl border border-border bg-card text-sm text-fg/80 shadow-raised">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          currentSection = block.text.toLowerCase();
          const headingClass =
            block.level === 1
              ? "font-display text-2xl text-fg"
              : block.level === 2
                ? "font-display text-xl text-fg"
                : "font-display text-lg text-fg";
          return (
            <h2 key={`h-${index}`} className={headingClass}>
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          if (currentSection.includes("citation")) {
            return <CitationList key={`list-${index}`} items={block.items} />;
          }
          if (currentSection.includes("risk register")) {
            return <RiskRegister key={`list-${index}`} items={block.items} />;
          }
          if (currentSection.includes("data quality")) {
            return <DataQuality key={`list-${index}`} items={block.items} />;
          }
          if (currentSection.includes("key finding")) {
            return <FindingsList key={`list-${index}`} items={block.items} />;
          }
          return (
            <ul key={`list-${index}`} className="space-y-2 pl-1">
              {block.items.map((entry, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
                  <span>{entry}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${index}`} className="text-fg/80 leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </article>
  );
}

/* ── Citation ref badge ── */
function RefBadge({ id }: { id: string }) {
  return (
    <span className="link-accent inline-flex items-center rounded-md bg-accent/8 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide">
      {id}
    </span>
  );
}

/* ── Citations section ── */
function CitationList({ items }: { items: string[] }) {
  const parsed = items.map((item) => {
    const colonIdx = item.indexOf(": ");
    if (colonIdx === -1) return { id: item, url: null };
    const id = item.slice(0, colonIdx).trim();
    const url = item.slice(colonIdx + 2).trim();
    return { id, url: url.startsWith("http") ? url : null };
  });

  return (
    <div className="grid gap-2">
      {parsed.map((cite) => (
        <div
          key={cite.id}
          className="flex items-start gap-3 rounded-lg border border-border/60 bg-bg/50 px-3 py-2.5"
        >
          <RefBadge id={cite.id} />
          {cite.url ? (
            <a
              href={cite.url}
              target="_blank"
              rel="noreferrer"
              className="group relative min-w-0 flex-1 truncate text-xs link-accent transition-colors hover:underline"
              title={cite.url}
            >
              <span className="truncate">{prettifyUrl(cite.url)}</span>
              <span className="absolute inset-0 -z-10 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-accent/5" />
            </a>
          ) : (
            <span className="text-xs text-muted italic">Local source</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Risk Register section ── */
function RiskRegister({ items }: { items: string[] }) {
  const rows = items.map((item) => {
    const parts = item.split("|").map((s) => s.trim());
    const riskId = parts[0] ?? "";
    const domain = parts[1] ?? "";
    const severity = extractValue(parts[2], "severity");
    const confidence = extractValue(parts[3], "confidence");
    const refs = extractRefs(parts[4]);
    return { riskId, domain, severity, confidence, refs };
  });

  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div
          key={row.riskId}
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-border/60 bg-bg/50 px-3 py-2.5 text-xs"
        >
          <span className="font-display text-sm font-medium text-fg">{row.domain}</span>
          <span className="text-muted">
            Severity{" "}
            <span className={`font-medium ${Number(row.severity) > 0 ? "text-warn" : "text-fg/70"}`}>
              {row.severity}
            </span>
          </span>
          <span className="text-muted">
            Confidence <span className="font-medium text-fg/70">{row.confidence}</span>
          </span>
          {row.refs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {row.refs.map((ref) => (
                <RefBadge key={ref} id={ref} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Data Quality section ── */
function DataQuality({ items }: { items: string[] }) {
  const kvPairs = items.flatMap((item) =>
    item.split("|").map((segment) => {
      const colonIdx = segment.indexOf(":");
      if (colonIdx === -1) return null;
      const key = segment.slice(0, colonIdx).trim();
      const value = segment.slice(colonIdx + 1).trim();
      return { key: prettifyKey(key), value: prettifyValue(value) };
    }).filter(Boolean) as { key: string; value: string }[]
  );

  return (
    <div className="flex flex-wrap gap-3">
      {kvPairs.map((kv) => (
        <div
          key={kv.key}
          className="rounded-lg border border-border/60 bg-bg/50 px-3 py-2"
        >
          <div className="text-[0.65rem] uppercase tracking-[0.14em] text-muted">{kv.key}</div>
          <div className="mt-0.5 text-sm font-medium text-fg">{kv.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Key Findings section ── */
function FindingsList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item, i) => {
        const { text, confidence, refs } = parseFindings(item);
        return (
          <div
            key={i}
            className="rounded-lg border border-border/60 bg-bg/50 px-3 py-2.5"
          >
            <p className="text-sm text-fg/80 leading-relaxed">{text}</p>
            {(confidence || refs.length > 0) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {confidence && (
                  <span className="text-[0.65rem] text-muted">
                    Confidence <span className="font-medium text-fg/70">{confidence}</span>
                  </span>
                )}
                {refs.map((ref) => (
                  <RefBadge key={ref} id={ref} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Helpers ── */

function prettifyUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    const path = u.pathname.length > 1 ? u.pathname.slice(0, 40) : "";
    return `${host}${path}${path.length >= 40 ? "..." : ""}`;
  } catch {
    return url.length > 60 ? `${url.slice(0, 57)}...` : url;
  }
}

function extractValue(segment: string | undefined, prefix: string): string {
  if (!segment) return "—";
  const cleaned = segment.replace(new RegExp(`^${prefix}[:\\s]*`, "i"), "").trim();
  return cleaned || "—";
}

function extractRefs(segment: string | undefined): string[] {
  if (!segment) return [];
  const cleaned = segment.replace(/^refs?[:\s]*/i, "").trim();
  if (!cleaned || cleaned === "none") return [];
  return cleaned.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseFindings(text: string): { text: string; confidence: string | null; refs: string[] } {
  const match = text.match(/\(confidence\s+([\d.]+),?\s*refs?:\s*([^)]*)\)\s*$/);
  if (!match) return { text, confidence: null, refs: [] };
  const cleanText = text.slice(0, match.index).trim();
  const confidence = match[1];
  const refsRaw = match[2].trim();
  const refs = refsRaw === "none" ? [] : refsRaw.split(",").map((s) => s.trim()).filter(Boolean);
  return { text: cleanText, confidence, refs };
}

function prettifyKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\bpct\b/i, "%");
}

function prettifyValue(value: string): string {
  const cleaned = value.replace(/^\[['"]?|['"]?\]$/g, "");
  if (cleaned === "True") return "Yes";
  if (cleaned === "False") return "No";
  return cleaned;
}
