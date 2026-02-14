"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

function renderNode(label: string, value: unknown, depth = 0): ReactNode {
  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value);
  if (Array.isArray(value)) {
    return (
      <details key={`${label}-${depth}`} open={depth < 1}>
        <summary className="cursor-pointer text-xs text-muted">
          {label}: [{value.length}]
        </summary>
        <div className="mt-2 border-l border-border/70 pl-3">
          {value.map((item, index) => (
            <div key={`${label}-${index}`} className="py-1">
              {renderNode(`[${index}]`, item, depth + 1)}
            </div>
          ))}
        </div>
      </details>
    );
  }
  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <details key={`${label}-${depth}`} open={depth < 1}>
        <summary className="cursor-pointer text-xs text-muted">
          {label}: {"{"}
          {entries.length}
          {"}"}
        </summary>
        <div className="mt-2 border-l border-border/70 pl-3">
          {entries.map(([key, child]) => (
            <div key={`${label}-${key}`} className="py-1">
              {renderNode(key, child, depth + 1)}
            </div>
          ))}
        </div>
      </details>
    );
  }
  return (
    <div key={`${label}-${depth}`} className="text-xs leading-relaxed">
      <span className="text-muted">{label}:</span> {String(value)}
    </div>
  );
}

export function JsonViewer({ value }: { value: Record<string, unknown> | null }) {
  const [copied, setCopied] = useState(false);
  const prettyJson = useMemo(() => JSON.stringify(value ?? {}, null, 2), [value]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prettyJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!value) {
    return <p className="text-sm text-muted">No JSON payload available.</p>;
  }

  return (
    <div className="stack-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-[0.1em] text-muted">JSON Viewer</div>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </div>
      <div className="rounded-lg border border-border/80 bg-bg/55 p-3">
        {renderNode("root", value, 0)}
      </div>
      <details>
        <summary className="cursor-pointer text-xs text-muted">Raw JSON</summary>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-border/80 bg-bg/55 p-3 text-xs leading-relaxed text-fg/90">
{prettyJson}
        </pre>
      </details>
    </div>
  );
}
