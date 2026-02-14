import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeader } from "@/components/SectionHeader";
import { DashboardSmartView } from "@/components/dashboards/DashboardSmartView";
import { JsonViewer } from "@/components/dashboards/JsonViewer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  detectKnownDashboardKind,
  getKnownDashboardKindLabel,
} from "@/data/dashboards";
import { loadDashboardJson, loadDashboardsIndex } from "@/data/loaders";

function text(value: unknown, fallback = "n/a") {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ name: string }> | { name: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const name = decodeURIComponent(resolvedParams.name ?? "");
  const dashboardsIndexResult = await loadDashboardsIndex();
  const entries = dashboardsIndexResult.index?.dashboards ?? [];
  const entry = entries.find((item) => item.name === name);

  if (!entry) {
    return (
      <div className="page-shell section-y text-sm">
        <Breadcrumb segments={[{ label: "Dashboards", href: "/dashboards" }, { label: name }]} />
        <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
          <SectionHeader title="Dashboard Not Found" subtitle="This dashboard is not listed in the current index." />
          <p className="text-sm text-muted">Requested name: {name}</p>
          <div className="mt-4">
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboards">Back to dashboards</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const dataResult = await loadDashboardJson(entry.relpath);
  const knownKind = detectKnownDashboardKind(entry);

  return (
    <div className="page-shell section-y text-sm">
      <Breadcrumb
        segments={[
          { label: "Dashboards", href: "/dashboards" },
          { label: entry.name },
        ]}
      />
      <ScrollReveal>
        <section className="card-pad rounded-2xl border border-border/90 bg-card shadow-raised">
          <div className="section-label">Dashboard detail</div>
          <h1 className="mt-3 font-display text-2xl font-normal text-fg md:text-3xl">{entry.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="neutral">Kind: {getKnownDashboardKindLabel(knownKind)}</Badge>
            <Badge variant="neutral">Bytes: {text(entry.bytes)}</Badge>
            <Badge variant="neutral">SHA256: {text(entry.sha256)}</Badge>
          </div>
          <p className="mt-3 text-xs text-muted">relpath: {entry.relpath}</p>
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/data/site_export.v1/${entry.relpath}`} target="_blank">
                Open Raw File
              </Link>
            </Button>
          </div>
        </section>
      </ScrollReveal>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-raised">
        <SectionHeader title="Smart View" subtitle="Known dashboard rendering with schema-safe fallback behavior." />
        {dataResult.value ? (
          <DashboardSmartView entry={entry} data={dataResult.value} />
        ) : (
          <p className="text-sm text-muted">
            Dashboard payload could not be loaded. {dataResult.error ?? "No additional details."}
          </p>
        )}
      </section>

      <section className="card-pad rounded-xl border border-border/90 bg-card shadow-flush">
        <SectionHeader title="JSON" subtitle="Collapsible JSON viewer and copy helper." />
        {dataResult.error ? <p className="mb-3 text-sm text-muted">Load warning: {dataResult.error}</p> : null}
        <JsonViewer value={dataResult.value} />
      </section>
    </div>
  );
}
